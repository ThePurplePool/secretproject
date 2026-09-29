// services/consultant-service/src/index.ts
// Consultant Service: Level 3 Qualification Assessment & Community Referral Mechanics

import express, { Request, Response } from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createLogger } from '../../../packages/logging/src';

const logger = createLogger('consultant-service');
const app = express();
const PORT = process.env.PORT || 3006;
const CERTIFICATE_SERVICE_URL = process.env.CERTIFICATE_SERVICE_URL || 'http://localhost:3007';
const INTERNAL_TOKEN = process.env.INTERNAL_SERVICE_TOKEN || 'anti-scam-internal-secret-2026';

app.use(cors());
app.use(express.json());

// Database-per-service: Consultant Service owns consultant.db
const dataDir = path.join(process.cwd(), 'data', 'consultant');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const db = new Database(path.join(dataDir, 'consultant.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS consultant_assessments (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    scenario_id TEXT NOT NULL,
    q1_what_happened TEXT NOT NULL,
    q2_suspicious_signs TEXT NOT NULL,
    q3_action_needed TEXT NOT NULL,
    score INTEGER NOT NULL,
    feedback TEXT NOT NULL,
    is_passed INTEGER NOT NULL,
    submitted_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS referral_tracking (
    code TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    invited_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

// Health
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'UP', service: 'consultant-service', timestamp: new Date().toISOString() });
});

app.get('/ready', (_req: Request, res: Response) => {
  try {
    db.prepare('SELECT 1').get();
    res.json({ ready: true });
  } catch (err: any) {
    res.status(503).json({ ready: false, error: err.message });
  }
});

// Submit Level 3 Consultant Structured Written Response (AC-CONSULT-03)
app.post('/assessments', async (req: Request, res: Response) => {
  const {
    userId = 'anonymous_defender',
    scenarioId,
    caseId,
    q1WhatHappened = '',
    q2SuspiciousSigns = '',
    q3ActionNeeded = '',
    analysisText = '',
    actionPlan = '',
    preventionRule = '',
  } = req.body;

  const targetScenarioId = scenarioId || caseId || 'consultant-case-001';
  const q1 = q1WhatHappened || analysisText;
  const q2 = q2SuspiciousSigns || actionPlan;
  const q3 = q3ActionNeeded || preventionRule;

  // Authoritative grading of written response
  let score = 70;
  const signs = (q1 + ' ' + q2 + ' ' + q3).toLowerCase();

  // Scoring rubric: mentions technical vectors, urgency/psychology, and proper defensive action
  if (signs.includes('домен') || signs.includes('ссылк') || signs.includes('url') || signs.includes('apk') || signs.includes('разрешен') || signs.includes('троян') || signs.includes('click')) {
    score += 15;
  }
  if (signs.includes('паник') || signs.includes('давлен') || signs.includes('срочн') || signs.includes('манипуляц') || signs.includes('эмоцион')) {
    score += 10;
  }
  if (signs.includes('приложен') || signs.includes('банк') || signs.includes('поддержк') || signs.includes('провер') || signs.includes('заблокир')) {
    score += 5;
  }

  score = Math.min(100, score);
  const isPassed = score >= 75;
  const assessmentId = crypto.randomUUID();
  const submittedAt = new Date().toISOString();

  const feedback = isPassed
    ? 'Отличный структурированный разбор! Вы точно выявили вектор атаки, обратили внимание на ключевые технические индикаторы и сформулировали защитный регламент для гражданина.'
    : 'Хороший анализ ситуации. Экспертный совет: в рекомендациях всегда требуйте не просто закрыть окно, но и проверить официальные каналы банка.';

  db.prepare(`
    INSERT INTO consultant_assessments (id, user_id, scenario_id, q1_what_happened, q2_suspicious_signs, q3_action_needed, score, feedback, is_passed, submitted_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(assessmentId, userId, targetScenarioId, q1, q2, q3, score, feedback, isPassed ? 1 : 0, submittedAt);

  // If passed, issue Level 3 Consultant Certificate
  let consultantCertificate = null;
  if (isPassed) {
    try {
      const certRes = await fetch(`${CERTIFICATE_SERVICE_URL}/certificates/issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-service-token': INTERNAL_TOKEN },
        body: JSON.stringify({
          userId,
          username: userId,
          level: 3,
          levelName: 'Консультант',
          title: 'Сертификат квалифицированного Anti-Scam Консультанта',
        }),
      });
      if (certRes.ok) {
        consultantCertificate = await certRes.json();
      }
    } catch (err: any) {
      logger.warn('Failed to issue consultant certificate', { details: err.message });
    }
  }

  res.status(201).json({
    id: assessmentId,
    score,
    isPassed,
    approved: isPassed,
    feedback,
    submittedAt,
    consultantCertificate,
  });
});

// Community / Referral invitation tracking
app.post('/referrals/invite', (req: Request, res: Response) => {
  const { referralCode } = req.body;
  if (!referralCode) {
    return res.status(400).json({ error: { code: 'MISSING_CODE', message: 'referralCode is required' } });
  }

  const existing = db.prepare('SELECT * FROM referral_tracking WHERE code = ?').get(referralCode) as any;
  const now = new Date().toISOString();

  if (existing) {
    db.prepare('UPDATE referral_tracking SET invited_count = invited_count + 1, updated_at = ? WHERE code = ?').run(now, referralCode);
  } else {
    db.prepare('INSERT INTO referral_tracking (code, user_id, invited_count, created_at, updated_at) VALUES (?, ?, 1, ?, ?)').run(
      referralCode,
      'user_owner',
      now,
      now
    );
  }

  const updated = db.prepare('SELECT * FROM referral_tracking WHERE code = ?').get(referralCode) as any;
  res.json({ success: true, code: referralCode, invitedCount: updated.invited_count });
});

app.listen(PORT, () => {
  logger.info(`Consultant Service listening on port ${PORT}`);
});
