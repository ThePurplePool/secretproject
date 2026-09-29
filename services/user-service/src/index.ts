// services/user-service/src/index.ts
// User Service: User Profiles, Language, Preferences, Achievements, Metadata

import express, { Request, Response } from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { createLogger } from '../../../packages/logging/src';

const logger = createLogger('user-service');
const app = express();
const PORT = process.env.PORT || 3002;
const PROGRESS_SERVICE_URL = process.env.PROGRESS_SERVICE_URL || 'http://localhost:3005';
const CERTIFICATE_SERVICE_URL = process.env.CERTIFICATE_SERVICE_URL || 'http://localhost:3007';

app.use(cors());
app.use(express.json());

// Database-per-service: User Service owns users.db
const dataDir = path.join(process.cwd(), 'data', 'user');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const db = new Database(path.join(dataDir, 'users.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS user_profiles (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    language TEXT NOT NULL DEFAULT 'ru',
    theme TEXT NOT NULL DEFAULT 'light',
    referral_code TEXT UNIQUE NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

// Health
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'UP', service: 'user-service', timestamp: new Date().toISOString() });
});

app.get('/ready', (_req: Request, res: Response) => {
  try {
    db.prepare('SELECT 1').get();
    res.json({ ready: true });
  } catch (err: any) {
    res.status(503).json({ ready: false, error: err.message });
  }
});

// Profile initialization (called on registration or first login)
app.post('/profiles', (req: Request, res: Response) => {
  const { userId, username } = req.body;
  if (!userId || !username) {
    return res.status(400).json({ error: { code: 'MISSING_FIELDS', message: 'userId and username are required' } });
  }

  const existing = db.prepare('SELECT * FROM user_profiles WHERE id = ?').get(userId);
  if (existing) {
    return res.json({ profile: existing });
  }

  const now = new Date().toISOString();
  const referralCode = `UZ-${username.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) || 'SAFE'}-${Math.floor(100 + Math.random() * 900)}`;

  db.prepare(`
    INSERT INTO user_profiles (id, username, language, theme, referral_code, created_at, updated_at)
    VALUES (?, ?, 'ru', 'light', ?, ?, ?)
  `).run(userId, username, referralCode, now, now);

  const profile = db.prepare('SELECT * FROM user_profiles WHERE id = ?').get(userId);
  res.status(201).json({ profile });
});

// Get user profile aggregated with progress & certificates
app.get('/profiles/:id', async (req: Request, res: Response) => {
  const userId = req.params.id;
  let profile = db.prepare('SELECT * FROM user_profiles WHERE id = ?').get(userId) as any;

  if (!profile) {
    // Check by username if id is a username
    profile = db.prepare('SELECT * FROM user_profiles WHERE username = ?').get(userId) as any;
  }

  if (!profile) {
    // Auto-create default profile if not found
    const now = new Date().toISOString();
    const referralCode = `UZ-DEF-${Math.floor(1000 + Math.random() * 9000)}`;
    db.prepare(`
      INSERT INTO user_profiles (id, username, language, theme, referral_code, created_at, updated_at)
      VALUES (?, ?, 'ru', 'light', ?, ?, ?)
    `).run(userId, userId, referralCode, now, now);
    profile = db.prepare('SELECT * FROM user_profiles WHERE id = ?').get(userId) as any;
  }

  // Fetch progress from progress-service
  let progressData: any = {
    currentBalance: 10000000,
    initialBalance: 10000000,
    totalLoss: 0,
    scenariosCompleted: 0,
    scenariosFailed: 0,
    scenariosTotal: 35,
    level: 1,
    levelName: 'Базовый',
  };

  try {
    const progRes = await fetch(`${PROGRESS_SERVICE_URL}/progress/${profile.id}`);
    if (progRes.ok) {
      progressData = await progRes.json();
    }
  } catch (err) {
    logger.warn('Could not contact progress-service', { details: err });
  }

  // Fetch certificates from certificate-service
  let certificates: any[] = [];
  try {
    const certRes = await fetch(`${CERTIFICATE_SERVICE_URL}/certificates/user/${profile.id}`);
    if (certRes.ok) {
      certificates = await certRes.json();
    }
  } catch (err) {
    logger.warn('Could not contact certificate-service', { details: err });
  }

  res.json({
    user: {
      id: profile.id,
      username: profile.username,
      language: profile.language,
      theme: profile.theme,
      referralCode: profile.referral_code,
      currentBalance: progressData.currentBalance ?? 10000000,
      initialBalance: progressData.initialBalance ?? 10000000,
      totalLoss: progressData.totalLoss ?? 0,
      scenariosCompleted: progressData.scenariosCompleted ?? 0,
      scenariosFailed: progressData.scenariosFailed ?? 0,
      scenariosTotal: 35,
      level: progressData.level ?? 1,
      levelName: progressData.levelName ?? 'Базовый',
    },
    certificates,
  });
});

// Update preferences
app.put('/profiles/:id', (req: Request, res: Response) => {
  const userId = req.params.id;
  const { language, theme } = req.body;
  const now = new Date().toISOString();

  db.prepare(`
    UPDATE user_profiles
    SET language = COALESCE(?, language), theme = COALESCE(?, theme), updated_at = ?
    WHERE id = ?
  `).run(language, theme, now, userId);

  const updated = db.prepare('SELECT * FROM user_profiles WHERE id = ?').get(userId);
  res.json({ profile: updated });
});

app.listen(PORT, () => {
  logger.info(`User Service listening on port ${PORT}`);
});
