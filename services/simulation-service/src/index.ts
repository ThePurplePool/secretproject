// services/simulation-service/src/index.ts
// Simulation Service: Authoritative runtime sessions, server-side timer, decision outcomes

import express, { Request, Response } from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createLogger } from '../../../packages/logging/src';

const logger = createLogger('simulation-service');
const app = express();
const PORT = process.env.PORT || 3004;

const SCENARIO_SERVICE_URL = process.env.SCENARIO_SERVICE_URL || 'http://localhost:3003';
const PROGRESS_SERVICE_URL = process.env.PROGRESS_SERVICE_URL || 'http://localhost:3005';
const INTERNAL_TOKEN = process.env.INTERNAL_SERVICE_TOKEN || 'anti-scam-internal-secret-2026';

app.use(cors());
app.use(express.json());

// Database-per-service: Simulation Service owns simulations.db
const dataDir = path.join(process.cwd(), 'data', 'simulations');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const db = new Database(path.join(dataDir, 'simulations.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS simulation_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    scenario_id TEXT NOT NULL,
    started_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    time_limit_seconds INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    completed_at TEXT,
    selected_action_id TEXT,
    is_safe INTEGER,
    simulated_loss INTEGER DEFAULT 0,
    created_at TEXT NOT NULL
  );
`);

// Health
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'UP', service: 'simulation-service', timestamp: new Date().toISOString() });
});

app.get('/ready', (_req: Request, res: Response) => {
  try {
    db.prepare('SELECT 1').get();
    res.json({ ready: true });
  } catch (err: any) {
    res.status(503).json({ ready: false, error: err.message });
  }
});

// Start a new simulation session (TEST-001.1 & AC-TIMER-01)
app.post('/simulations', async (req: Request, res: Response) => {
  const { scenarioId, userId = 'anonymous_defender' } = req.body;
  if (!scenarioId) {
    return res.status(400).json({ error: { code: 'MISSING_SCENARIO_ID', message: 'scenarioId is required' } });
  }

  // Fetch authoritative scenario metadata from scenario-service
  let scenario: any = null;
  try {
    const scRes = await fetch(`${SCENARIO_SERVICE_URL}/scenarios/${scenarioId}`);
    if (!scRes.ok) {
      return res.status(404).json({ error: { code: 'SCENARIO_NOT_FOUND', message: 'Сценарий не найден' } });
    }
    scenario = await scRes.json();
  } catch (err: any) {
    logger.error('Failed to reach scenario-service', { details: err.message });
    return res.status(503).json({ error: { code: 'UPSTREAM_ERROR', message: 'Scenario service unavailable' } });
  }

  const sessionId = crypto.randomUUID();
  const startedAt = new Date().toISOString();
  const timeLimitSeconds = scenario.timeLimit || 20;
  const expiresAt = new Date(Date.now() + timeLimitSeconds * 1000).toISOString();

  db.prepare(`
    INSERT INTO simulation_sessions (id, user_id, scenario_id, started_at, expires_at, time_limit_seconds, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', ?)
  `).run(sessionId, userId, scenarioId, startedAt, expiresAt, timeLimitSeconds, startedAt);

  logger.info(`Simulation session started: ${sessionId} for scenario ${scenarioId}`);

  res.status(201).json({
    sessionId,
    id: sessionId,
    scenarioId,
    userId,
    startedAt,
    expiresAt,
    timeLimit: timeLimitSeconds,
    serverTime: Date.now(),
    serverTimestamp: Date.now(),
    timeLimitSeconds,
    status: 'ACTIVE',
  });
});

// Get session state
app.get('/simulations/:id', (req: Request, res: Response) => {
  const session = db.prepare('SELECT * FROM simulation_sessions WHERE id = ?').get(req.params.id) as any;
  if (!session) {
    return res.status(404).json({ error: { code: 'SESSION_NOT_FOUND', message: 'Сессия симуляции не найдена' } });
  }

  const nowMs = Date.now();
  const expiresMs = new Date(session.expires_at).getTime();
  const secondsRemaining = Math.max(0, Math.floor((expiresMs - nowMs) / 1000));
  const isExpired = secondsRemaining === 0 && session.status === 'ACTIVE';

  res.json({
    ...session,
    secondsRemaining,
    isExpired,
  });
});

// Submit user action (decision) in simulation (TEST-001.2 - TEST-001.5)
app.post('/simulations/:id/actions', async (req: Request, res: Response) => {
  const sessionId = req.params.id;
  const { actionId, reactionTimeSeconds } = req.body;

  const session = db.prepare('SELECT * FROM simulation_sessions WHERE id = ?').get(sessionId) as any;
  if (!session) {
    return res.status(404).json({ error: { code: 'SESSION_NOT_FOUND', message: 'Сессия симуляции не найдена' } });
  }

  if (session.status !== 'ACTIVE') {
    return res.status(400).json({ error: { code: 'SESSION_ALREADY_FINISHED', message: 'Сессия уже завершена' } });
  }

  // Fetch scenario definition
  const scRes = await fetch(`${SCENARIO_SERVICE_URL}/scenarios/${session.scenario_id}`);
  if (!scRes.ok) {
    return res.status(502).json({ error: { code: 'SCENARIO_FETCH_FAILED', message: 'Не удалось получить данные сценария' } });
  }
  const scenario = await scRes.json();

  // Find action details
  const action = (scenario.availableActions || []).find((a: any) => a.id === actionId);
  const isSafeAction = action ? action.isCorrect : false;
  const consequenceOutcome = scenario.consequences?.[actionId] || {
    title: isSafeAction ? 'Правильное решение' : 'Финансовые потери',
    chain: isSafeAction
      ? ['Опасное вложение проигнорировано', 'Вредоносный код не попал на устройство', 'Банковский счёт в безопасности']
      : ['Переход по ссылке/запуск', 'Компрометация реквизитов', 'Несанкционированное списание средств'],
    types: isSafeAction ? [] : ['FINANCIAL_LOSS', 'CREDENTIAL_EXPOSURE'],
    simulatedLoss: isSafeAction ? 0 : (scenario.startingBalance ? Math.min(1500000, scenario.startingBalance) : 1500000),
    summary: isSafeAction
      ? 'Вы успешно защитили свои средства и устройство от взлома.'
      : 'Мошенники получили доступ к вашим средствам из-за опасного действия.',
  };

  const simulatedLoss = consequenceOutcome.simulatedLoss || 0;
  const completedAt = new Date().toISOString();

  // Update session
  db.prepare(`
    UPDATE simulation_sessions
    SET status = ?, completed_at = ?, selected_action_id = ?, is_safe = ?, simulated_loss = ?
    WHERE id = ?
  `).run(isSafeAction ? 'COMPLETED' : 'FAILED', completedAt, actionId, isSafeAction ? 1 : 0, simulatedLoss, sessionId);

  // Synchronously update Progress Service
  let updatedProgress: any = null;
  try {
    const progRes = await fetch(`${PROGRESS_SERVICE_URL}/progress/${session.user_id}/record-simulation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-service-token': INTERNAL_TOKEN },
      body: JSON.stringify({
        scenarioId: session.scenario_id,
        isSafe: isSafeAction,
        simulatedLoss,
      }),
    });
    if (progRes.ok) {
      updatedProgress = await progRes.json();
    }
  } catch (err: any) {
    logger.warn('Failed to notify progress-service', { details: err.message });
  }

  logger.info(`Simulation decision evaluated: session=${sessionId} safe=${isSafeAction} loss=${simulatedLoss}`);

  res.json({
    success: true,
    isSuccess: isSafeAction,
    isSafe: isSafeAction,
    isDangerous: !isSafeAction,
    simulatedLoss,
    consequenceLoss: simulatedLoss,
    consequenceChain: consequenceOutcome.chain,
    consequence: consequenceOutcome,
    feedback: scenario.feedback,
    retryScenarioId: scenario.retryScenarioId || session.scenario_id,
    userProgress: updatedProgress?.progress,
  });
});

app.listen(PORT, () => {
  logger.info(`Simulation Service listening on port ${PORT}`);
});
