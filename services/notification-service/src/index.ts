// services/notification-service/src/index.ts
// Notification Service: Multi-channel delivery abstraction (Email, Telegram, SMS, Push)

import express, { Request, Response } from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { createLogger } from '../../../packages/logging/src';

const logger = createLogger('notification-service');
const app = express();
const PORT = process.env.PORT || 3011;

app.use(cors());
app.use(express.json());

interface NotificationLog {
  id: string;
  recipient: string;
  channel: 'email' | 'telegram' | 'sms' | 'push';
  title: string;
  message: string;
  status: 'SENT' | 'FAILED';
  sentAt: string;
}

const notificationHistory: NotificationLog[] = [];

// Health
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'UP', service: 'notification-service', timestamp: new Date().toISOString() });
});

app.get('/ready', (_req: Request, res: Response) => {
  res.json({ ready: true });
});

// Send notification
app.post('/notifications/send', (req: Request, res: Response) => {
  const { recipient, channel = 'telegram', title = 'Уведомление Anti-Scam', message } = req.body;

  if (!recipient || !message) {
    return res.status(400).json({ error: { code: 'MISSING_FIELDS', message: 'recipient and message are required' } });
  }

  const notification: NotificationLog = {
    id: `NOTIF-${crypto.randomUUID()}`,
    recipient,
    channel,
    title,
    message,
    status: 'SENT',
    sentAt: new Date().toISOString(),
  };

  notificationHistory.unshift(notification);
  if (notificationHistory.length > 100) notificationHistory.pop();

  logger.info(`Notification dispatched: ${notification.id} via ${channel} to ${recipient}`);

  res.status(201).json({ success: true, notification });
});

// View history
app.get('/notifications/history', (_req: Request, res: Response) => {
  res.json(notificationHistory);
});

app.listen(PORT, () => {
  logger.info(`Notification Service listening on port ${PORT}`);
});
