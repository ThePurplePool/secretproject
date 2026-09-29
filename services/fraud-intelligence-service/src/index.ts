// services/fraud-intelligence-service/src/index.ts
// Fraud Intelligence Service: Entity Extraction, Rule-based Clustering, Threat Analysis

import express, { Request, Response } from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createLogger } from '../../../packages/logging/src';

const logger = createLogger('fraud-intelligence-service');
const app = express();
const PORT = process.env.PORT || 3009;

app.use(cors());
app.use(express.json());

// Database-per-service: owns intelligence.db
const dataDir = path.join(process.cwd(), 'data', 'intelligence');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const db = new Database(path.join(dataDir, 'intelligence.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS scam_clusters (
    id TEXT PRIMARY KEY,
    primary_identifier TEXT NOT NULL,
    type TEXT NOT NULL,
    reports_count INTEGER NOT NULL DEFAULT 1,
    confidence_score REAL NOT NULL DEFAULT 0.5,
    threat_level TEXT NOT NULL DEFAULT 'medium',
    first_seen TEXT NOT NULL,
    last_seen TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS cluster_entities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cluster_id TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_value TEXT NOT NULL,
    FOREIGN KEY(cluster_id) REFERENCES scam_clusters(id)
  );

  CREATE TABLE IF NOT EXISTS cluster_reports (
    cluster_id TEXT NOT NULL,
    report_id TEXT NOT NULL,
    PRIMARY KEY(cluster_id, report_id)
  );
`);

// Health
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'UP', service: 'fraud-intelligence-service', timestamp: new Date().toISOString() });
});

app.get('/ready', (_req: Request, res: Response) => {
  try {
    db.prepare('SELECT 1').get();
    res.json({ ready: true });
  } catch (err: any) {
    res.status(503).json({ ready: false, error: err.message });
  }
});

// Deterministic entity correlation and cluster linkage (AC-FRAUD-02)
app.post('/correlate', (req: Request, res: Response) => {
  const { reportId, phoneNumber, telegramAccount, url, bankCard, category, createdAt } = req.body;

  const entities: { type: string; value: string }[] = [];
  if (phoneNumber) entities.push({ type: 'phone', value: phoneNumber });
  if (telegramAccount) entities.push({ type: 'telegram', value: telegramAccount });
  if (url) entities.push({ type: 'url', value: url });
  if (bankCard) entities.push({ type: 'card', value: bankCard });

  if (entities.length === 0) {
    return res.json({ clustered: false, message: 'No extractable entities' });
  }

  // Look for any existing cluster containing ANY of these entities
  let matchedClusterId: string | null = null;
  for (const ent of entities) {
    const existing = db.prepare(`
      SELECT cluster_id FROM cluster_entities WHERE entity_type = ? AND entity_value = ?
    `).get(ent.type, ent.value) as any;
    if (existing) {
      matchedClusterId = existing.cluster_id;
      break;
    }
  }

  const now = createdAt || new Date().toISOString();

  if (matchedClusterId) {
    // Add report to existing cluster
    db.prepare('INSERT OR IGNORE INTO cluster_reports (cluster_id, report_id) VALUES (?, ?)').run(matchedClusterId, reportId);

    // Add any new entities to this cluster
    for (const ent of entities) {
      const exists = db.prepare('SELECT id FROM cluster_entities WHERE cluster_id = ? AND entity_type = ? AND entity_value = ?').get(
        matchedClusterId,
        ent.type,
        ent.value
      );
      if (!exists) {
        db.prepare('INSERT INTO cluster_entities (cluster_id, entity_type, entity_value) VALUES (?, ?, ?)').run(
          matchedClusterId,
          ent.type,
          ent.value
        );
      }
    }

    // Recalculate reports count, confidence, threat level
    const repCount = (db.prepare('SELECT COUNT(*) as c FROM cluster_reports WHERE cluster_id = ?').get(matchedClusterId) as any).c;
    const confidence = Math.min(0.98, 0.6 + repCount * 0.05);
    const threat = repCount >= 5 ? 'critical' : repCount >= 2 ? 'high' : 'medium';

    db.prepare(`
      UPDATE scam_clusters
      SET reports_count = ?, confidence_score = ?, threat_level = ?, last_seen = ?
      WHERE id = ?
    `).run(repCount, confidence, threat, now, matchedClusterId);

    logger.info(`Correlated report ${reportId} into existing cluster ${matchedClusterId} (count=${repCount})`);
    return res.json({ clustered: true, clusterId: matchedClusterId, isNew: false, reportsCount: repCount });
  }

  // Create new cluster around the primary entity
  const primary = entities[0];
  const newClusterId = `CLUST-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  db.prepare(`
    INSERT INTO scam_clusters (id, primary_identifier, type, reports_count, confidence_score, threat_level, first_seen, last_seen)
    VALUES (?, ?, ?, 1, 0.65, 'medium', ?, ?)
  `).run(newClusterId, primary.value, primary.type, now, now);

  for (const ent of entities) {
    db.prepare('INSERT INTO cluster_entities (cluster_id, entity_type, entity_value) VALUES (?, ?, ?)').run(
      newClusterId,
      ent.type,
      ent.value
    );
  }
  db.prepare('INSERT INTO cluster_reports (cluster_id, report_id) VALUES (?, ?)').run(newClusterId, reportId);

  logger.info(`Created new scam cluster ${newClusterId} around ${primary.value}`);
  res.status(201).json({ clustered: true, clusterId: newClusterId, isNew: true, reportsCount: 1 });
});

// List scam clusters (Internal Intelligence API for Admin / Security Analysts)
app.get('/clusters', (_req: Request, res: Response) => {
  const clusters = db.prepare('SELECT * FROM scam_clusters ORDER BY reports_count DESC, last_seen DESC LIMIT 50').all() as any[];

  const detailed = clusters.map((c) => {
    const ents = db.prepare('SELECT entity_type, entity_value FROM cluster_entities WHERE cluster_id = ?').all(c.id) as any[];
    const phones = ents.filter((e) => e.entity_type === 'phone').map((e) => e.entity_value);
    const summary = ents.map((e) => e.entity_value).join(', ');
    return {
      id: c.id,
      primaryIdentifier: c.primary_identifier,
      title: `Кластер угроз: ${c.primary_identifier}`,
      type: c.type,
      reportsCount: c.reports_count,
      reportCount: c.reports_count,
      confidenceScore: c.confidence_score,
      threatLevel: c.threat_level,
      firstSeen: c.first_seen,
      lastSeen: c.last_seen,
      matchedPhones: phones,
      indicatorsSummary: summary,
      associatedEntities: {
        phones,
        telegramAccounts: ents.filter((e) => e.entity_type === 'telegram').map((e) => e.entity_value),
        urls: ents.filter((e) => e.entity_type === 'url').map((e) => e.entity_value),
        cards: ents.filter((e) => e.entity_type === 'card').map((e) => e.entity_value),
      },
    };
  });

  res.json(detailed);
});

// Get single cluster details
app.get('/clusters/:id', (req: Request, res: Response) => {
  const c = db.prepare('SELECT * FROM scam_clusters WHERE id = ?').get(req.params.id) as any;
  if (!c) {
    return res.status(404).json({ error: { code: 'CLUSTER_NOT_FOUND', message: 'Кластер не найден' } });
  }

  const ents = db.prepare('SELECT entity_type, entity_value FROM cluster_entities WHERE cluster_id = ?').all(c.id) as any[];
  const reports = db.prepare('SELECT report_id FROM cluster_reports WHERE cluster_id = ?').all(c.id) as any[];

  res.json({
    id: c.id,
    primaryIdentifier: c.primary_identifier,
    type: c.type,
    reportsCount: c.reports_count,
    confidenceScore: c.confidence_score,
    threatLevel: c.threat_level,
    firstSeen: c.first_seen,
    lastSeen: c.last_seen,
    entities: ents,
    reportIds: reports.map((r) => r.report_id),
  });
});

app.listen(PORT, () => {
  logger.info(`Fraud Intelligence Service listening on port ${PORT}`);
});
