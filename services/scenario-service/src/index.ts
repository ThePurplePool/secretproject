// services/scenario-service/src/index.ts
// Scenario Service: Authoritative source of Scenarios, Categories, Actions, Consequences

import express, { Request, Response } from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { createLogger } from '../../../packages/logging/src';
import { SEED_SCENARIOS } from './data/seedScenarios';

const logger = createLogger('scenario-service');
const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

// Database-per-service: Scenario Service owns scenarios.db
const dataDir = path.join(process.cwd(), 'data', 'scenarios');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const db = new Database(path.join(dataDir, 'scenarios.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS scenarios (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    difficulty INTEGER NOT NULL,
    level INTEGER NOT NULL,
    interface TEXT NOT NULL,
    time_limit INTEGER NOT NULL,
    starting_balance INTEGER NOT NULL,
    data_json TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
  );
`);

// Seed scenarios in database if empty or out of date
const count = (db.prepare('SELECT COUNT(*) as c FROM scenarios').get() as any).c;
if (count < SEED_SCENARIOS.length) {
  const insert = db.prepare(`
    INSERT OR REPLACE INTO scenarios (id, title, category, difficulty, level, interface, time_limit, starting_balance, data_json, is_active, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const now = new Date().toISOString();
  for (const sc of SEED_SCENARIOS) {
    insert.run(
      sc.id,
      sc.title,
      sc.category,
      sc.difficulty,
      sc.level,
      sc.interface,
      sc.timeLimit,
      sc.startingBalance,
      JSON.stringify(sc),
      sc.isActive ? 1 : 0,
      now
    );
  }
  logger.info(`Seeded ${SEED_SCENARIOS.length} scenarios into scenarios.db`);
}

// Health checks
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'UP', service: 'scenario-service', timestamp: new Date().toISOString() });
});

app.get('/ready', (_req: Request, res: Response) => {
  try {
    db.prepare('SELECT 1').get();
    res.json({ ready: true });
  } catch (err: any) {
    res.status(503).json({ ready: false, error: err.message });
  }
});

// List all scenarios
app.get('/scenarios', (_req: Request, res: Response) => {
  const rows = db.prepare('SELECT data_json FROM scenarios WHERE is_active = 1').all() as any[];
  const scenarios = rows.map((r) => JSON.parse(r.data_json));
  res.json(scenarios);
});

// Get scenario by ID
app.get('/scenarios/:id', (req: Request, res: Response) => {
  const row = db.prepare('SELECT data_json FROM scenarios WHERE id = ?').get(req.params.id) as any;
  if (!row) {
    return res.status(404).json({
      error: { code: 'SCENARIO_NOT_FOUND', message: `Сценарий с ID '${req.params.id}' не найден` },
    });
  }
  res.json(JSON.parse(row.data_json));
});

// Get scenario available actions
app.get('/scenarios/:id/actions', (req: Request, res: Response) => {
  const row = db.prepare('SELECT data_json FROM scenarios WHERE id = ?').get(req.params.id) as any;
  if (!row) {
    return res.status(404).json({
      error: { code: 'SCENARIO_NOT_FOUND', message: 'Сценарий не найден' },
    });
  }
  const sc = JSON.parse(row.data_json);
  res.json({
    scenarioId: sc.id,
    actions: sc.availableActions,
  });
});

app.listen(PORT, () => {
  logger.info(`Scenario Service listening on port ${PORT}`);
});
