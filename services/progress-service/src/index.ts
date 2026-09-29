// services/progress-service/src/index.ts
// Progress & Scoring Service: Virtual Balance, Levels 1-3, Statistics

import express, { Request, Response } from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { createLogger } from '../../../packages/logging/src';

const logger = createLogger('progress-service');
const app = express();
const PORT = process.env.PORT || 3005;
const CERTIFICATE_SERVICE_URL = process.env.CERTIFICATE_SERVICE_URL || 'http://localhost:3007';
const INTERNAL_TOKEN = process.env.INTERNAL_SERVICE_TOKEN || 'anti-scam-internal-secret-2026';

app.use(cors());
app.use(express.json());

// Database-per-service: Progress Service owns progress.db
const dataDir = path.join(process.cwd(), 'data', 'progress');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const db = new Database(path.join(dataDir, 'progress.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS user_progress (
    user_id TEXT PRIMARY KEY,
    current_balance INTEGER NOT NULL DEFAULT 10000000,
    initial_balance INTEGER NOT NULL DEFAULT 10000000,
    total_loss INTEGER NOT NULL DEFAULT 0,
    scenarios_completed INTEGER NOT NULL DEFAULT 0,
    scenarios_failed INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1,
    level_name TEXT NOT NULL DEFAULT 'Базовый',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS progress_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    scenario_id TEXT NOT NULL,
    is_safe INTEGER NOT NULL,
    simulated_loss INTEGER NOT NULL,
    created_at TEXT NOT NULL
  );
`);

function calculateLevel(completedCount: number): { level: 1 | 2 | 3; levelName: string } {
  if (completedCount >= 5) {
    return { level: 3, levelName: 'Консультант' };
  }
  if (completedCount >= 3) {
    return { level: 2, levelName: 'Защитник' };
  }
  return { level: 1, levelName: 'Базовый' };
}

// Health
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'UP', service: 'progress-service', timestamp: new Date().toISOString() });
});

app.get('/ready', (_req: Request, res: Response) => {
  try {
    db.prepare('SELECT 1').get();
    res.json({ ready: true });
  } catch (err: any) {
    res.status(503).json({ ready: false, error: err.message });
  }
});

// Init user progress record
app.post('/progress/:userId/init', (req: Request, res: Response) => {
  const userId = req.params.userId;
  const existing = db.prepare('SELECT * FROM user_progress WHERE user_id = ?').get(userId);
  if (existing) {
    return res.json(existing);
  }

  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO user_progress (user_id, current_balance, initial_balance, total_loss, scenarios_completed, scenarios_failed, level, level_name, created_at, updated_at)
    VALUES (?, 10000000, 10000000, 0, 0, 0, 1, 'Базовый', ?, ?)
  `).run(userId, now, now);

  const created = db.prepare('SELECT * FROM user_progress WHERE user_id = ?').get(userId);
  res.status(201).json(created);
});

// Get user progress
app.get('/progress/:userId', (req: Request, res: Response) => {
  const userId = req.params.userId;
  let p = db.prepare('SELECT * FROM user_progress WHERE user_id = ?').get(userId) as any;

  if (!p) {
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO user_progress (user_id, current_balance, initial_balance, total_loss, scenarios_completed, scenarios_failed, level, level_name, created_at, updated_at)
      VALUES (?, 10000000, 10000000, 0, 0, 0, 1, 'Базовый', ?, ?)
    `).run(userId, now, now);
    p = db.prepare('SELECT * FROM user_progress WHERE user_id = ?').get(userId) as any;
  }

  res.json({
    userId: p.user_id,
    currentBalance: p.current_balance,
    initialBalance: p.initial_balance,
    totalLoss: p.total_loss,
    scenariosCompleted: p.scenarios_completed,
    scenariosFailed: p.scenarios_failed,
    level: p.level,
    levelName: p.level_name,
    scenariosTotal: 35,
  });
});

// Record simulation decision
app.post('/progress/:userId/record-simulation', async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const { scenarioId, isSafe, simulatedLoss = 0 } = req.body;

  let p = db.prepare('SELECT * FROM user_progress WHERE user_id = ?').get(userId) as any;
  const now = new Date().toISOString();

  if (!p) {
    db.prepare(`
      INSERT INTO user_progress (user_id, current_balance, initial_balance, total_loss, scenarios_completed, scenarios_failed, level, level_name, created_at, updated_at)
      VALUES (?, 10000000, 10000000, 0, 0, 0, 1, 'Базовый', ?, ?)
    `).run(userId, now, now);
    p = db.prepare('SELECT * FROM user_progress WHERE user_id = ?').get(userId) as any;
  }

  const newBalance = Math.max(0, p.current_balance - simulatedLoss);
  const newLoss = p.total_loss + simulatedLoss;
  const newCompleted = isSafe ? p.scenarios_completed + 1 : p.scenarios_completed;
  const newFailed = !isSafe ? p.scenarios_failed + 1 : p.scenarios_failed;
  const oldLevel = p.level;
  const { level: newLevel, levelName: newLevelName } = calculateLevel(newCompleted);

  db.prepare(`
    UPDATE user_progress
    SET current_balance = ?, total_loss = ?, scenarios_completed = ?, scenarios_failed = ?, level = ?, level_name = ?, updated_at = ?
    WHERE user_id = ?
  `).run(newBalance, newLoss, newCompleted, newFailed, newLevel, newLevelName, now, userId);

  db.prepare(`
    INSERT INTO progress_history (user_id, scenario_id, is_safe, simulated_loss, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(userId, scenarioId, isSafe ? 1 : 0, simulatedLoss, now);

  // If level unlocked, request certificate generation from certificate-service
  if (newLevel > oldLevel) {
    logger.info(`User ${userId} advanced from level ${oldLevel} to level ${newLevel}`);
    fetch(`${CERTIFICATE_SERVICE_URL}/certificates/issue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-service-token': INTERNAL_TOKEN },
      body: JSON.stringify({
        userId,
        username: userId,
        level: newLevel,
        levelName: newLevelName,
        title: newLevel === 3 ? 'Сертификат Anti-Scam Консультанта' : 'Сертификат Защитника (Defender)',
      }),
    }).catch(() => {});
  }

  const updated = db.prepare('SELECT * FROM user_progress WHERE user_id = ?').get(userId) as any;

  res.json({
    success: true,
    progress: {
      userId: updated.user_id,
      currentBalance: updated.current_balance,
      initialBalance: updated.initial_balance,
      totalLoss: updated.total_loss,
      scenariosCompleted: updated.scenarios_completed,
      scenariosFailed: updated.scenarios_failed,
      level: updated.level,
      levelName: updated.level_name,
      levelChanged: newLevel !== oldLevel,
    },
  });
});

app.listen(PORT, () => {
  logger.info(`Progress Service listening on port ${PORT}`);
});
