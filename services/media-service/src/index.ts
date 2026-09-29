// services/media-service/src/index.ts
// Media Service: File upload, binary storage abstraction (S3/MinIO/Local)

import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createLogger } from '../../../packages/logging/src';

const logger = createLogger('media-service');
const app = express();
const PORT = process.env.PORT || 3012;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const storageDir = path.join(process.cwd(), 'data', 'media_assets');
if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}

// Storage Provider Abstraction (Section 14)
export interface StorageProvider {
  save(filename: string, buffer: Buffer, mimeType: string): Promise<string>;
  get(filename: string): Promise<{ buffer: Buffer; mimeType: string } | null>;
}

export class LocalDiskStorageProvider implements StorageProvider {
  async save(filename: string, buffer: Buffer, _mimeType: string): Promise<string> {
    const filePath = path.join(storageDir, filename);
    await fs.promises.writeFile(filePath, buffer);
    return `/media/${filename}`;
  }

  async get(filename: string): Promise<{ buffer: Buffer; mimeType: string } | null> {
    const filePath = path.join(storageDir, filename);
    if (!fs.existsSync(filePath)) return null;
    const buffer = await fs.promises.readFile(filePath);
    return { buffer, mimeType: 'image/png' };
  }
}

const storage: StorageProvider = new LocalDiskStorageProvider();

// Health
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'UP', service: 'media-service', timestamp: new Date().toISOString() });
});

app.get('/ready', (_req: Request, res: Response) => {
  res.json({ ready: true });
});

// Upload media asset
app.post('/media/upload', async (req: Request, res: Response) => {
  const { dataBase64, filename = 'asset.png', mimeType = 'image/png' } = req.body;

  if (!dataBase64) {
    return res.status(400).json({ error: { code: 'MISSING_DATA', message: 'dataBase64 is required' } });
  }

  const cleanBase64 = dataBase64.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(cleanBase64, 'base64');
  const safeExt = path.extname(filename) || '.png';
  const uniqueName = `media_${Date.now()}_${crypto.randomUUID().slice(0, 8)}${safeExt}`;

  const mediaUrl = await storage.save(uniqueName, buffer, mimeType);
  logger.info(`Media uploaded: ${uniqueName} (${buffer.length} bytes)`);

  res.status(201).json({
    id: uniqueName,
    url: mediaUrl,
    size: buffer.length,
    mimeType,
  });
});

// Serve media asset
app.get('/media/:id', async (req: Request, res: Response) => {
  const file = await storage.get(req.params.id as string);
  if (!file) {
    return res.status(404).json({ error: { code: 'MEDIA_NOT_FOUND', message: 'Файл не найден' } });
  }

  res.setHeader('Content-Type', file.mimeType);
  res.send(file.buffer);
});

app.listen(PORT, () => {
  logger.info(`Media Service listening on port ${PORT}`);
});
