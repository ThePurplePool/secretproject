// services/certificate-service/src/index.ts
// Certificate Service: Issue, Sign, Verify Certificates & Digital Badges

import express, { Request, Response } from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createLogger } from '../../../packages/logging/src';

const logger = createLogger('certificate-service');
const app = express();
const PORT = process.env.PORT || 3007;

app.use(cors());
app.use(express.json());

// Database-per-service: Certificate Service owns certificates.db
const dataDir = path.join(process.cwd(), 'data', 'certificates');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const db = new Database(path.join(dataDir, 'certificates.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS certificates (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    username TEXT NOT NULL,
    level INTEGER NOT NULL,
    level_name TEXT NOT NULL,
    title TEXT NOT NULL,
    issued_at TEXT NOT NULL,
    verification_hash TEXT NOT NULL,
    qr_payload TEXT NOT NULL,
    is_revoked INTEGER NOT NULL DEFAULT 0
  );
`);

// Health
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'UP', service: 'certificate-service', timestamp: new Date().toISOString() });
});

app.get('/ready', (_req: Request, res: Response) => {
  try {
    db.prepare('SELECT 1').get();
    res.json({ ready: true });
  } catch (err: any) {
    res.status(503).json({ ready: false, error: err.message });
  }
});

// Issue new certificate
app.post('/certificates/issue', (req: Request, res: Response) => {
  const { userId, username = userId, level = 2, levelName = 'Защитник', title = 'Сертификат цифровой устойчивости' } = req.body;

  if (!userId) {
    return res.status(400).json({ error: { code: 'MISSING_USER_ID', message: 'userId is required' } });
  }

  // Prevent duplicate certificate for same level
  const existing = db.prepare('SELECT * FROM certificates WHERE user_id = ? AND level = ?').get(userId, level);
  if (existing) {
    return res.json(existing);
  }

  const certId = `CERT-UZ-${level}-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
  const issuedAt = new Date().toISOString();
  const rawSignatureString = `${certId}:${userId}:${level}:${issuedAt}:ANTI-SCAM-UZBEKISTAN-NATIONAL-SYSTEM`;
  const verificationHash = crypto.createHash('sha256').update(rawSignatureString).digest('hex');
  const qrPayload = `https://anti-scam.uz/verify/${verificationHash}`;

  db.prepare(`
    INSERT INTO certificates (id, user_id, username, level, level_name, title, issued_at, verification_hash, qr_payload, is_revoked)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
  `).run(certId, userId, username, level, levelName, title, issuedAt, verificationHash, qrPayload);

  const cert = db.prepare('SELECT * FROM certificates WHERE id = ?').get(certId) as any;
  logger.info(`Issued certificate ${certId} with hash ${verificationHash}`);

  res.status(201).json({
    id: cert.id,
    userId: cert.user_id,
    username: cert.username,
    level: cert.level,
    levelName: cert.level_name,
    title: cert.title,
    issuedAt: cert.issued_at,
    verificationHash: cert.verification_hash,
    qrPayload: cert.qr_payload,
  });
});

// Get certificates by user
app.get('/certificates/user/:userId', (req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM certificates WHERE user_id = ? AND is_revoked = 0 ORDER BY level ASC').all(req.params.userId) as any[];
  const certs = rows.map((r) => ({
    id: r.id,
    certificateId: r.id,
    userId: r.user_id,
    username: r.username,
    level: r.level,
    levelNumber: r.level,
    levelName: r.level_name,
    title: r.title,
    issuedAt: r.issued_at,
    verificationHash: r.verification_hash,
    qrPayload: r.qr_payload,
  }));
  res.json(certs);
});

// Public certificate verification (AC-CERT-03)
app.get('/certificates/:id/verify', (req: Request, res: Response) => {
  const queryId = req.params.id;
  const cert = db.prepare(`
    SELECT * FROM certificates
    WHERE (id = ? OR verification_hash = ?) AND is_revoked = 0
  `).get(queryId, queryId) as any;

  if (!cert) {
    return res.status(404).json({
      verified: false,
      error: { code: 'CERTIFICATE_NOT_FOUND', message: 'Сертификат не найден или был отозван' },
    });
  }

  res.json({
    verified: true,
    certificate: {
      id: cert.id,
      certificateId: cert.id,
      username: cert.username,
      level: cert.level,
      levelNumber: cert.level,
      levelName: cert.level_name,
      title: cert.title,
      issuedAt: cert.issued_at,
      verificationHash: cert.verification_hash,
    },
    organization: 'Национальная система противодействия мошенничеству Anti-Scam Uzbekistan',
    standard: 'СТ РУз / Государственный стандарт цифровой грамотности',
  });
});

app.listen(PORT, () => {
  logger.info(`Certificate Service listening on port ${PORT}`);
});
