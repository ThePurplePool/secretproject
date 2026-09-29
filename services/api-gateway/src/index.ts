// services/api-gateway/src/index.ts
// Public API Gateway for Anti-Scam Uzbekistan microservices architecture

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { createLogger } from '../../../packages/logging/src';
import { OPENAPI_SPEC } from '../../../packages/api-contracts/src';

const logger = createLogger('api-gateway');
const app = express();
const PORT = process.env.PORT || 5000;

// Internal Microservices URLs (configured via environment or defaults for local/Docker)
const SERVICES = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  user: process.env.USER_SERVICE_URL || 'http://localhost:3002',
  scenario: process.env.SCENARIO_SERVICE_URL || 'http://localhost:3003',
  simulation: process.env.SIMULATION_SERVICE_URL || 'http://localhost:3004',
  progress: process.env.PROGRESS_SERVICE_URL || 'http://localhost:3005',
  consultant: process.env.CONSULTANT_SERVICE_URL || 'http://localhost:3006',
  certificate: process.env.CERTIFICATE_SERVICE_URL || 'http://localhost:3007',
  fraudReporting: process.env.FRAUD_REPORTING_SERVICE_URL || 'http://localhost:3008',
  fraudIntel: process.env.FRAUD_INTEL_SERVICE_URL || 'http://localhost:3009',
  voice: process.env.VOICE_SERVICE_URL || 'http://localhost:3010',
  notification: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3011',
  media: process.env.MEDIA_SERVICE_URL || 'http://localhost:3012',
};

const INTERNAL_TOKEN = process.env.INTERNAL_SERVICE_TOKEN || 'anti-scam-internal-secret-2026';

// 1. CORS & Request Parsing
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id', 'x-correlation-id', 'x-service-token'],
}));
app.use(express.json({ limit: '10mb' }));

// 2. Correlation ID & Request Tracking Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const reqId = (req.headers['x-request-id'] as string) || crypto.randomUUID();
  const corrId = (req.headers['x-correlation-id'] as string) || reqId;

  req.headers['x-request-id'] = reqId;
  req.headers['x-correlation-id'] = corrId;
  res.setHeader('x-request-id', reqId);
  res.setHeader('x-correlation-id', corrId);

  const start = Date.now();
  res.on('finish', () => {
    logger.logRequest(req.method, req.path, res.statusCode, Date.now() - start, {
      requestId: reqId,
      correlationId: corrId,
    });
  });

  next();
});

// 3. Simple Rate Limiting (Protects downstream microservices from abuse)
const ipRequestCounts = new Map<string, { count: number; resetAt: number }>();
app.use((req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 300;

  const current = ipRequestCounts.get(ip);
  if (!current || now > current.resetAt) {
    ipRequestCounts.set(ip, { count: 1, resetAt: now + windowMs });
    return next();
  }

  current.count++;
  if (current.count > maxRequests) {
    return res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Превышен лимит запросов. Пожалуйста, подождите минуту.',
        requestId: req.headers['x-request-id'],
      },
    });
  }

  next();
});

// Helper for proxying HTTP requests with timeouts and error normalization
async function forwardRequest(
  targetBaseUrl: string,
  targetPath: string,
  req: Request,
  res: Response,
  timeoutMs = 5000
) {
  const reqId = req.headers['x-request-id'] as string;
  const corrId = req.headers['x-correlation-id'] as string;
  const url = `${targetBaseUrl}${targetPath}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-request-id': reqId,
    'x-correlation-id': corrId,
    'x-service-token': INTERNAL_TOKEN,
  };

  if (req.headers.authorization) {
    headers['Authorization'] = req.headers.authorization;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const fetchOptions: RequestInit = {
      method: req.method,
      headers,
      signal: controller.signal,
    };

    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body && Object.keys(req.body).length > 0) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const response = await fetch(url, fetchOptions);
    clearTimeout(timer);

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      return res.status(response.status).json(data);
    } else {
      const text = await response.text();
      return res.status(response.status).send(text);
    }
  } catch (err: any) {
    clearTimeout(timer);
    const isTimeout = err.name === 'AbortError';
    logger.error(`Gateway error communicating with upstream ${targetBaseUrl}`, {
      details: err.message,
      path: targetPath,
      requestId: reqId,
    });

    return res.status(isTimeout ? 504 : 502).json({
      error: {
        code: isTimeout ? 'GATEWAY_TIMEOUT' : 'SERVICE_UNAVAILABLE',
        message: isTimeout
          ? 'Время ожидания ответа от сервиса истекло'
          : 'Целевой микросервис временно недоступен',
        requestId: reqId,
      },
    });
  }
}

// 4. OpenAPI Documentation
app.get('/api/docs', (_req: Request, res: Response) => {
  res.json(OPENAPI_SPEC);
});

// 5. Health & Readiness Probe
app.get('/health', async (req: Request, res: Response) => {
  const healthStatuses: Record<string, string> = {};
  let allHealthy = true;

  const checkPromises = Object.entries(SERVICES).map(async ([name, url]) => {
    try {
      const resp = await fetch(`${url}/health`, { signal: AbortSignal.timeout(1500) });
      healthStatuses[name] = resp.ok ? 'UP' : 'DEGRADED';
      if (!resp.ok) allHealthy = false;
    } catch {
      healthStatuses[name] = 'DOWN';
      allHealthy = false;
    }
  });

  await Promise.all(checkPromises);

  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'UP' : 'DEGRADED',
    gateway: 'UP',
    services: healthStatuses,
    timestamp: new Date().toISOString(),
  });
});

app.get('/ready', (_req: Request, res: Response) => {
  res.json({ ready: true, gateway: 'API Gateway v1 ready' });
});

// 6. API v1 Routes Routing (Section 3 & Section 4)

// 6.1 Auth Service Routes (/api/v1/auth/*)
app.use('/api/v1/auth', (req: Request, res: Response) => {
  forwardRequest(SERVICES.auth, req.url, req, res);
});

// 6.2 User Service Routes (/api/v1/users/*)
app.use('/api/v1/users', (req: Request, res: Response) => {
  forwardRequest(SERVICES.user, `/profiles${req.url === '/' ? '' : req.url}`, req, res);
});

// 6.3 Scenario Service Routes (/api/v1/scenarios/* and /api/v1/scenarios)
app.use('/api/v1/scenarios', (req: Request, res: Response) => {
  forwardRequest(SERVICES.scenario, `/scenarios${req.url === '/' ? '' : req.url}`, req, res);
});

// 6.4 Simulation Service Routes (/api/v1/simulations/* and /api/v1/simulations)
app.use('/api/v1/simulations', (req: Request, res: Response) => {
  forwardRequest(SERVICES.simulation, `/simulations${req.url === '/' ? '' : req.url}`, req, res);
});

// 6.5 Progress Service Routes (/api/v1/progress/*)
app.use('/api/v1/progress', (req: Request, res: Response) => {
  forwardRequest(SERVICES.progress, `/progress${req.url === '/' ? '' : req.url}`, req, res);
});

// 6.6 Consultant Service Routes (/api/v1/consultant/*)
app.use('/api/v1/consultant', (req: Request, res: Response) => {
  forwardRequest(SERVICES.consultant, req.url, req, res);
});

// 6.7 Certificate Service Routes (/api/v1/certificates/*)
app.use('/api/v1/certificates', (req: Request, res: Response) => {
  forwardRequest(SERVICES.certificate, `/certificates${req.url === '/' ? '' : req.url}`, req, res);
});

// 6.8 Fraud Reporting Service Routes (/api/v1/reports/* and /api/v1/reports)
app.get(['/api/v1/reports/clusters', '/api/reports/clusters'], (req: Request, res: Response) => {
  forwardRequest(SERVICES.fraudIntel, '/clusters', req, res);
});

app.use('/api/v1/reports', (req: Request, res: Response) => {
  forwardRequest(SERVICES.fraudReporting, `/reports${req.url === '/' ? '' : req.url}`, req, res);
});

// 6.9 Fraud Intelligence Service Routes (/api/v1/fraud-intelligence/*)
app.use('/api/v1/fraud-intelligence', (req: Request, res: Response) => {
  forwardRequest(SERVICES.fraudIntel, req.url, req, res);
});

// 6.10 Voice Service Routes (/api/v1/voice/*)
app.use('/api/v1/voice', (req: Request, res: Response) => {
  forwardRequest(SERVICES.voice, req.url, req, res);
});

// 6.11 Notification Service Routes (/api/v1/notifications/*)
app.use('/api/v1/notifications', (req: Request, res: Response) => {
  forwardRequest(SERVICES.notification, req.url, req, res);
});

// 6.12 Media Service Routes (/api/v1/media/*)
app.use('/api/v1/media', (req: Request, res: Response) => {
  forwardRequest(SERVICES.media, req.url, req, res);
});

// 6.13 Admin Service / Aggregated Admin Routes (/api/v1/admin/*)
app.get('/api/v1/admin/stats', async (req: Request, res: Response) => {
  try {
    const [scRes, repRes, clustRes] = await Promise.all([
      fetch(`${SERVICES.scenario}/scenarios`),
      fetch(`${SERVICES.fraudReporting}/reports`),
      fetch(`${SERVICES.fraudIntel}/clusters`),
    ]);

    const scenarios = scRes.ok ? await scRes.json() : [];
    const reports = repRes.ok ? await repRes.json() : [];
    const clusters = clustRes.ok ? await clustRes.json() : [];

    res.json({
      totalScenarios: scenarios.length,
      totalReports: reports.length,
      totalClusters: clusters.length,
      activeUsersEstimate: 50420,
      defendedFundsEstimate: 4280000000,
    });
  } catch (err: any) {
    res.status(500).json({ error: { code: 'ADMIN_STATS_ERROR', message: err.message } });
  }
});

app.get('/api/v1/admin/clusters', (req: Request, res: Response) => {
  forwardRequest(SERVICES.fraudIntel, '/clusters', req, res);
});

app.get('/api/v1/admin/reports', (req: Request, res: Response) => {
  forwardRequest(SERVICES.fraudReporting, '/reports', req, res);
});

// 7. Backward Compatibility: Transparent Routing for legacy endpoints
app.post('/api/users/register', (req: Request, res: Response) => {
  forwardRequest(SERVICES.auth, '/register', req, res);
});

app.post('/api/user/register', (req: Request, res: Response) => {
  forwardRequest(SERVICES.auth, '/register', req, res);
});

app.post('/api/users/login', (req: Request, res: Response) => {
  forwardRequest(SERVICES.auth, '/login', req, res);
});

app.post('/api/user/login', (req: Request, res: Response) => {
  forwardRequest(SERVICES.auth, '/login', req, res);
});

async function resolveUserId(req: Request): Promise<string> {
  if (req.body?.userId && req.body.userId !== 'anonymous') return req.body.userId;
  if (req.headers['x-user-id'] && req.headers['x-user-id'] !== 'anonymous') return req.headers['x-user-id'] as string;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const vRes = await fetch(`${SERVICES.auth}/verify`, {
        headers: { Authorization: authHeader },
      });
      if (vRes.ok) {
        const vData = await vRes.json();
        if (vData.user?.id) return vData.user.id;
      }
    } catch {}
  }
  return (req.query.userId as string) || 'anonymous';
}

app.get('/api/user/profile', async (req: Request, res: Response) => {
  const userId = await resolveUserId(req);
  forwardRequest(SERVICES.user, `/profiles/${userId}`, req, res);
});

app.get('/api/users/profile', async (req: Request, res: Response) => {
  const userId = await resolveUserId(req);
  forwardRequest(SERVICES.user, `/profiles/${userId}`, req, res);
});

app.post('/api/scenarios/:id/start', async (req: Request, res: Response) => {
  const userId = await resolveUserId(req);
  req.body = { scenarioId: req.params.id, userId };
  forwardRequest(SERVICES.simulation, '/simulations', req, res);
});

app.post('/api/scenarios/:id/decision', async (req: Request, res: Response) => {
  const scenarioId = req.params.id;
  const { actionId } = req.body;
  const userId = await resolveUserId(req);

  let sessionId = req.body.sessionId;
  if (!sessionId) {
    const startResp = await fetch(`${SERVICES.simulation}/simulations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenarioId, userId }),
    });

    if (!startResp.ok) {
      return res.status(startResp.status).json(await startResp.json());
    }
    const startData = await startResp.json();
    sessionId = startData.sessionId;
  }

  const decisionResp = await fetch(`${SERVICES.simulation}/simulations/${sessionId}/actions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ actionId }),
  });

  const decisionData = await decisionResp.json();

  // Fetch updated user profile
  const profileResp = await fetch(`${SERVICES.user}/profiles/${userId}`);
  const profileData = profileResp.ok ? await profileResp.json() : null;

  res.json({
    ...decisionData,
    user: profileData?.user,
    certificates: profileData?.certificates || [],
  });
});

app.use('/api/scenarios', (req: Request, res: Response) => {
  forwardRequest(SERVICES.scenario, `/scenarios${req.url === '/' ? '' : req.url}`, req, res);
});

app.get(['/api/certificates/:id/verify', '/api/users/certificates/verify/:id', '/api/user/certificates/verify/:id'], (req: Request, res: Response) => {
  forwardRequest(SERVICES.certificate, `/certificates/${req.params.id}/verify`, req, res);
});

app.post(['/api/consultant/review', '/api/users/consultant/review', '/api/user/consultant/review'], async (req: Request, res: Response) => {
  const userId = await resolveUserId(req);
  req.body = { ...req.body, userId };
  forwardRequest(SERVICES.consultant, '/assessments', req, res);
});

app.post('/api/consultant/invite', (req: Request, res: Response) => {
  forwardRequest(SERVICES.consultant, '/referrals/invite', req, res);
});

app.post('/api/reports', (req: Request, res: Response) => {
  forwardRequest(SERVICES.fraudReporting, '/reports', req, res);
});

app.get('/api/reports/clusters', (req: Request, res: Response) => {
  forwardRequest(SERVICES.fraudIntel, '/clusters', req, res);
});

app.use('/api/voice', (req: Request, res: Response) => {
  forwardRequest(SERVICES.voice, req.url, req, res);
});

app.use('/api/admin', (req: Request, res: Response) => {
  forwardRequest('http://localhost:' + PORT, `/api/v1/admin${req.url}`, req, res);
});

// 8. 404 Fallback with normalized error
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Маршрут '${req.method} ${req.path}' не найден в API Gateway`,
      requestId: req.headers['x-request-id'],
    },
  });
});

app.listen(PORT, () => {
  logger.info(`=======================================================`);
  logger.info(`🛡️ Anti-Scam Uzbekistan API Gateway running on port ${PORT}`);
  logger.info(`=======================================================`);
  logger.info(`Public Versioned API: http://localhost:${PORT}/api/v1/...`);
  logger.info(`API Documentation:    http://localhost:${PORT}/api/docs`);
  logger.info(`Gateway Health:       http://localhost:${PORT}/health`);
});
