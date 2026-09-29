// services/auth-service/src/index.ts
// Auth Service: Registration, Login, Sessions, JWT/Token issuance, Roles & Permissions

import express, { Request, Response } from 'express';
import cors from 'cors';
import crypto from 'crypto';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { createLogger } from '../../../packages/logging/src';
import { validateUsername } from '../../../packages/validation/src';

const logger = createLogger('auth-service');
const app = express();
const PORT = process.env.PORT || 3001;
const INTERNAL_TOKEN = process.env.INTERNAL_SERVICE_TOKEN || 'anti-scam-internal-secret-2026';

app.use(cors());
app.use(express.json());

// Database-per-service: Auth Service owns auth.db
const dataDir = path.join(process.cwd(), 'data', 'auth');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const db = new Database(path.join(dataDir, 'auth.db'));

// Schema initialization
db.exec(`
  CREATE TABLE IF NOT EXISTS auth_users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'USER',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS auth_sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES auth_users(id)
  );
`);

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_antiscam_salt_2026').digest('hex');
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Request timing & correlation middleware
app.use((req, res, next) => {
  const start = Date.now();
  const reqId = req.headers['x-request-id'] as string || crypto.randomUUID();
  res.setHeader('x-request-id', reqId);
  res.on('finish', () => {
    logger.logRequest(req.method, req.path, res.statusCode, Date.now() - start, { requestId: reqId });
  });
  next();
});

// Health checks
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'UP', service: 'auth-service', timestamp: new Date().toISOString() });
});

app.get('/ready', (_req: Request, res: Response) => {
  try {
    db.prepare('SELECT 1').get();
    res.json({ ready: true });
  } catch (err: any) {
    res.status(503).json({ ready: false, error: err.message });
  }
});

// Register
app.post('/register', async (req: Request, res: Response) => {
  const { username, password = 'DefaultPassword123!' } = req.body;
  const validation = validateUsername(username);
  if (!validation.isValid) {
    return res.status(400).json({ error: { code: 'INVALID_USERNAME', message: validation.error } });
  }

  const existing = db.prepare('SELECT id FROM auth_users WHERE username = ?').get(username);
  if (existing) {
    // If user exists, log them in or return conflict
    const user = db.prepare('SELECT * FROM auth_users WHERE username = ?').get(username) as any;
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
    db.prepare('INSERT INTO auth_sessions (token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)').run(
      token,
      user.id,
      expiresAt,
      new Date().toISOString()
    );

    return res.json({
      token,
      sessionToken: token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        currentBalance: 10000000,
        initialBalance: 10000000,
        level: 1,
        levelName: 'Базовый',
      },
    });
  }

  const userId = `user_${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  const passwordHash = hashPassword(password);
  const role = username.toLowerCase().includes('admin') ? 'ADMIN' : 'USER';

  db.prepare('INSERT INTO auth_users (id, username, password_hash, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)').run(
    userId,
    username,
    passwordHash,
    role,
    now,
    now
  );

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
  db.prepare('INSERT INTO auth_sessions (token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)').run(
    token,
    userId,
    expiresAt,
    now
  );

  // Synchronous service-to-service notification: notify user-service & progress-service
  const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:3002';
  const progressServiceUrl = process.env.PROGRESS_SERVICE_URL || 'http://localhost:3005';

  await Promise.all([
    fetch(`${userServiceUrl}/profiles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-service-token': INTERNAL_TOKEN },
      body: JSON.stringify({ userId, username, role }),
    }).catch(() => {}),
    fetch(`${progressServiceUrl}/progress/${userId}/init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-service-token': INTERNAL_TOKEN },
      body: JSON.stringify({ userId, username }),
    }).catch(() => {}),
  ]);

  res.status(201).json({
    token,
    sessionToken: token,
    user: {
      id: userId,
      username,
      role,
      currentBalance: 10000000,
      initialBalance: 10000000,
      level: 1,
      levelName: 'Базовый',
    },
  });
});

// Login
app.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username) {
    return res.status(400).json({ error: { code: 'MISSING_FIELDS', message: 'Имя пользователя обязательно' } });
  }

  const user = db.prepare('SELECT * FROM auth_users WHERE username = ?').get(username) as any;
  if (!user) {
    return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Пользователь не найден' } });
  }

  if (password) {
    const passwordHash = hashPassword(password);
    if (user.password_hash !== passwordHash && user.password_hash !== password) {
      return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Неверный пароль' } });
    }
  }

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
  db.prepare('INSERT INTO auth_sessions (token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)').run(
    token,
    user.id,
    expiresAt,
    new Date().toISOString()
  );

  res.json({
    token,
    sessionToken: token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
    },
  });
});

// Token Verification Endpoint (called by API Gateway)
app.get('/verify', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ valid: false, error: 'Missing or malformed Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  const session = db.prepare(`
    SELECT s.*, u.username, u.role
    FROM auth_sessions s
    JOIN auth_users u ON s.user_id = u.id
    WHERE s.token = ? AND s.expires_at > ?
  `).get(token, new Date().toISOString()) as any;

  if (!session) {
    return res.status(401).json({ valid: false, error: 'Session expired or invalid' });
  }

  res.json({
    valid: true,
    user: {
      id: session.user_id,
      username: session.username,
      role: session.role,
    },
  });
});

// Logout
app.post('/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    db.prepare('DELETE FROM auth_sessions WHERE token = ?').run(token);
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

app.listen(PORT, () => {
  logger.info(`Auth Service listening on port ${PORT}`);
});
