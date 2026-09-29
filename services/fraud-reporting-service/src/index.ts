// services/fraud-reporting-service/src/index.ts
// Fraud Reporting Service: User-facing fraud incident reporting

import express, { Request, Response } from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createLogger } from '../../../packages/logging/src';
import { normalizeUzbekPhoneNumber, sanitizeString } from '../../../packages/validation/src';

const logger = createLogger('fraud-reporting-service');
const app = express();
const PORT = process.env.PORT || 3008;
const FRAUD_INTEL_SERVICE_URL = process.env.FRAUD_INTEL_SERVICE_URL || 'http://localhost:3009';
const INTERNAL_TOKEN = process.env.INTERNAL_SERVICE_TOKEN || 'anti-scam-internal-secret-2026';

app.use(cors());
app.use(express.json());

// Database-per-service: owns fraud_reports.db
const dataDir = path.join(process.cwd(), 'data', 'fraud_reports');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const db = new Database(path.join(dataDir, 'fraud_reports.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS fraud_reports (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    phone_number TEXT,
    telegram_account TEXT,
    url TEXT,
    bank_card TEXT,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'SUBMITTED',
    screenshot_url TEXT,
    created_at TEXT NOT NULL
  );
`);

// Health
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'UP', service: 'fraud-reporting-service', timestamp: new Date().toISOString() });
});

app.get('/ready', (_req: Request, res: Response) => {
  try {
    db.prepare('SELECT 1').get();
    res.json({ ready: true });
  } catch (err: any) {
    res.status(503).json({ ready: false, error: err.message });
  }
});

// Submit fraud report (AC-FRAUD-01)
app.post('/reports', async (req: Request, res: Response) => {
  const {
    userId,
    phoneNumber,
    scammerPhone,
    telegramAccount,
    telegramHandle,
    url,
    fakeUrl,
    bankCard,
    description = '',
    category = 'phishing',
    scamType,
    screenshotUrl,
  } = req.body;

  const rawPhone = phoneNumber || scammerPhone;
  const rawTelegram = telegramAccount || telegramHandle;
  const rawUrl = url || fakeUrl;
  const rawCategory = category || scamType || 'phishing';

  if (!description && !rawPhone && !rawTelegram && !rawUrl && !bankCard) {
    return res.status(400).json({
      error: { code: 'EMPTY_REPORT', message: 'Необходимо указать хотя бы один признак мошенничества или описание' },
    });
  }

  const reportId = `REP-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
  const cleanPhone = normalizeUzbekPhoneNumber(rawPhone);
  const cleanTelegram = sanitizeString(rawTelegram);
  const cleanUrl = sanitizeString(rawUrl);
  const cleanCard = sanitizeString(bankCard);
  const cleanDesc = sanitizeString(description, 2000);
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO fraud_reports (id, user_id, phone_number, telegram_account, url, bank_card, description, category, status, screenshot_url, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'SUBMITTED', ?, ?)
  `).run(reportId, userId || null, cleanPhone, cleanTelegram, cleanUrl, cleanCard, cleanDesc, rawCategory, screenshotUrl || null, now);

  logger.info(`Fraud report submitted: ${reportId}`);

  // Forward entity data to Fraud Intelligence Service for correlation & clustering (await to ensure cluster is ready)
  try {
    await fetch(`${FRAUD_INTEL_SERVICE_URL}/correlate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-service-token': INTERNAL_TOKEN },
      body: JSON.stringify({
        reportId,
        phoneNumber: cleanPhone,
        telegramAccount: cleanTelegram,
        url: cleanUrl,
        bankCard: cleanCard,
        category: rawCategory,
        createdAt: now,
      }),
    });
  } catch (err: any) {
    logger.warn('Could not forward to fraud-intelligence-service', { details: err.message });
  }

  // User-facing response (never exposes internal intelligence data)
  res.status(201).json({
    id: reportId,
    status: 'SUBMITTED',
    category: rawCategory,
    createdAt: now,
    message: 'Обращение успешно принято и направлено в Центр анализа киберугроз Республики Узбекистан.',
  });
});

// Get user reports
app.get('/reports', (req: Request, res: Response) => {
  const userId = req.query.userId as string;
  let rows: any[] = [];
  if (userId) {
    rows = db.prepare('SELECT * FROM fraud_reports WHERE user_id = ? ORDER BY created_at DESC LIMIT 50').all(userId);
  } else {
    rows = db.prepare('SELECT * FROM fraud_reports ORDER BY created_at DESC LIMIT 50').all();
  }

  // Filter out any sensitive internal operational data
  const publicReports = rows.map((r) => ({
    id: r.id,
    category: r.category,
    description: r.description,
    phoneNumber: r.phone_number ? r.phone_number.substring(0, 7) + '***' : null,
    telegramAccount: r.telegram_account,
    url: r.url,
    status: r.status,
    createdAt: r.created_at,
  }));

  res.json(publicReports);
});

// Get single report status
app.get('/reports/:id', (req: Request, res: Response) => {
  const report = db.prepare('SELECT * FROM fraud_reports WHERE id = ?').get(req.params.id) as any;
  if (!report) {
    return res.status(404).json({ error: { code: 'REPORT_NOT_FOUND', message: 'Отчёт не найден' } });
  }

  res.json({
    id: report.id,
    status: report.status,
    category: report.category,
    createdAt: report.created_at,
  });
});

app.listen(PORT, () => {
  logger.info(`Fraud Reporting Service listening on port ${PORT}`);
});
