import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { initDatabase } from './db/database';
import { ScenarioService } from './services/scenarioService';

import userRoutes from './routes/userRoutes';
import scenarioRoutes from './routes/scenarioRoutes';
import reportRoutes from './routes/reportRoutes';
import voiceRoutes from './routes/voiceRoutes';
import adminRoutes from './routes/adminRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security and utility middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Initialize SQLite database and seed scenarios
initDatabase();
ScenarioService.initSeedData();
console.log('✅ SQLite Database & 10 Seed Scenarios initialized.');

// Mount API routes
app.use('/api/user', userRoutes);
app.use('/api/scenarios', scenarioRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Anti-Scam Uzbekistan API Server',
    version: '1.0.0',
  });
});

// Serve client static build in production if available
const clientBuildPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientBuildPath));

app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.url.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(clientBuildPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send('Anti-Scam Uzbekistan API is online. Start Vite client on port 3000 during development.');
    }
  });
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Произошла непредвиденная ошибка',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Anti-Scam Uzbekistan Server running at http://localhost:${PORT}`);
});
