// services/voice-service/src/index.ts
// Voice Service: AI Voice Scam Simulator with Provider Abstraction

import express, { Request, Response } from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createLogger } from '../../../packages/logging/src';

const logger = createLogger('voice-service');
const app = express();
const PORT = process.env.PORT || 3010;

app.use(cors());
app.use(express.json());

// Database-per-service: Voice Service owns voice.db
const dataDir = path.join(process.cwd(), 'data', 'voice');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const db = new Database(path.join(dataDir, 'voice.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS voice_calls (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    scenario_id TEXT NOT NULL,
    status TEXT NOT NULL,
    caller_name TEXT NOT NULL,
    caller_number TEXT NOT NULL,
    history_json TEXT NOT NULL,
    score INTEGER,
    outcome TEXT,
    started_at TEXT NOT NULL,
    ended_at TEXT
  );
`);

// 12. Voice Provider Abstraction (Section 12)
export interface VoiceProvider {
  startCall(scenarioId: string): Promise<{ callId: string; greeting: string; audioUrl?: string }>;
  sendAudio(callId: string, transcriptOrAudio: string): Promise<{ responseText: string; audioUrl?: string; isHangup: boolean }>;
  receiveAudio(callId: string): Promise<Buffer | null>;
  endCall(callId: string): Promise<{ outcome: string; score: number }>;
}

export class MockUzbekVoiceProvider implements VoiceProvider {
  async startCall(scenarioId: string): Promise<{ callId: string; greeting: string; audioUrl?: string }> {
    return {
      callId: crypto.randomUUID(),
      greeting: 'Здравствуйте! Я старший специалист отдела мониторинга межбанковских платежей Ташкента. По вашему счёту прямо сейчас зафиксирована попытка несанкционированного перевода. Вы подтверждаете операцию?',
      audioUrl: '/audio/greeting.mp3',
    };
  }

  async sendAudio(callId: string, transcript: string): Promise<{ responseText: string; audioUrl?: string; isHangup: boolean }> {
    const text = transcript.toLowerCase();
    if (text.includes('нет') || text.includes('не подтвержд') || text.includes('отмен') || text.includes('мошенник') || text.includes('сам позвоню')) {
      return {
        responseText: 'Внимание, если вы сбросите звонок, ваш счёт будет заблокирован на 48 часов! Назовите код подтверждения из SMS для срочной отмены!',
        audioUrl: '/audio/pressure.mp3',
        isHangup: false,
      };
    }
    if (text.includes('код') || text.includes('1') || text.includes('2') || text.includes('парол')) {
      return {
        responseText: 'Спасибо, код принят. Средства успешно списаны. (Звонок завершён злоумышленником)',
        audioUrl: '/audio/scammed.mp3',
        isHangup: true,
      };
    }
    return {
      responseText: 'Для обеспечения безопасности мы переводим вас на защищённый резервный счёт Центрального Банка. Не вешайте трубку!',
      audioUrl: '/audio/central_bank.mp3',
      isHangup: false,
    };
  }

  async receiveAudio(_callId: string): Promise<Buffer | null> {
    return null;
  }

  async endCall(_callId: string): Promise<{ outcome: string; score: number }> {
    return {
      outcome: 'Звонок прерван пользователем. Успешная защита от голосового фишинга (вишинга).',
      score: 100,
    };
  }
}

const voiceProvider: VoiceProvider = new MockUzbekVoiceProvider();

// Health
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'UP', service: 'voice-service', timestamp: new Date().toISOString() });
});

app.get('/ready', (_req: Request, res: Response) => {
  try {
    db.prepare('SELECT 1').get();
    res.json({ ready: true });
  } catch (err: any) {
    res.status(503).json({ ready: false, error: err.message });
  }
});

// Start call session
app.post('/voice/calls/start', async (req: Request, res: Response) => {
  const { scenarioId = 'fake-police-call-008', userId = 'anonymous' } = req.body;
  const started = await voiceProvider.startCall(scenarioId);
  const callId = started.callId;
  const now = new Date().toISOString();

  const history = [
    { sender: 'caller', text: started.greeting, timestamp: now },
  ];

  db.prepare(`
    INSERT INTO voice_calls (id, user_id, scenario_id, status, caller_name, caller_number, history_json, started_at)
    VALUES (?, ?, ?, 'IN_PROGRESS', 'Служба безопасности банка / МВД', '+998 71 200-00-00', ?, ?)
  `).run(callId, userId, scenarioId, JSON.stringify(history), now);

  logger.info(`Voice call session started: ${callId}`);

  res.status(201).json({
    callId,
    status: 'IN_PROGRESS',
    callerName: 'Служба безопасности банка / МВД',
    callerNumber: '+998 71 200-00-00',
    greeting: started.greeting,
    audioUrl: started.audioUrl,
  });
});

// Respond during call
app.post('/voice/calls/:id/respond', async (req: Request, res: Response) => {
  const callId = req.params.id as string;
  const { speechText = '' } = req.body;

  const call = db.prepare('SELECT * FROM voice_calls WHERE id = ?').get(callId) as any;
  if (!call) {
    return res.status(404).json({ error: { code: 'CALL_NOT_FOUND', message: 'Сессия звонка не найдена' } });
  }

  const result = await voiceProvider.sendAudio(callId, speechText);
  const history = JSON.parse(call.history_json);
  const now = new Date().toISOString();

  history.push({ sender: 'user', text: speechText, timestamp: now });
  history.push({ sender: 'caller', text: result.responseText, timestamp: now });

  const status = result.isHangup ? 'COMPLETED' : 'IN_PROGRESS';
  db.prepare('UPDATE voice_calls SET status = ?, history_json = ? WHERE id = ?').run(status, JSON.stringify(history), callId);

  res.json({
    callId,
    responseText: result.responseText,
    isHangup: result.isHangup,
    status,
  });
});

// End call
app.post('/voice/calls/:id/end', async (req: Request, res: Response) => {
  const callId = req.params.id as string;
  const call = db.prepare('SELECT * FROM voice_calls WHERE id = ?').get(callId) as any;
  if (!call) {
    return res.status(404).json({ error: { code: 'CALL_NOT_FOUND', message: 'Сессия звонка не найдена' } });
  }

  const endResult = await voiceProvider.endCall(callId);
  const now = new Date().toISOString();

  db.prepare('UPDATE voice_calls SET status = ?, score = ?, outcome = ?, ended_at = ? WHERE id = ?').run(
    'COMPLETED',
    endResult.score,
    endResult.outcome,
    now,
    callId
  );

  res.json({
    callId,
    status: 'COMPLETED',
    outcome: endResult.outcome,
    score: endResult.score,
    endedAt: now,
  });
});

app.listen(PORT, () => {
  logger.info(`Voice Service listening on port ${PORT}`);
});
