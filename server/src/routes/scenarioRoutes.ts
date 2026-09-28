import { Router, Request, Response } from 'express';
import { ScenarioService } from '../services/scenarioService';
import { UserService } from '../services/userService';

const router = Router();

// List all available scenarios
router.get('/', (req: Request, res: Response) => {
  try {
    const level = req.query.level ? parseInt(req.query.level as string, 10) : undefined;
    let scenarios = ScenarioService.getAllScenarios(true);

    if (level) {
      scenarios = scenarios.filter((s) => s.level === level);
    }

    res.json(scenarios);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get scenario by ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const scenario = ScenarioService.getScenarioById(String(req.params.id));
    if (!scenario) {
      return res.status(404).json({ error: 'Сценарий не найден' });
    }
    res.json(scenario);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Helper to extract user ID from token or headers or body
function getUserIdFromReq(req: Request): string | undefined {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const user = UserService.getUserByToken(token);
    if (user) return user.id;
  }
  const headerUserId = req.headers['x-user-id'] as string;
  if (headerUserId) return headerUserId;
  return req.body.userId;
}

// Start scenario session (authoritative server-side timestamp & timer tracking)
router.post('/:id/start', (req: Request, res: Response) => {
  try {
    const scenarioId = String(req.params.id);
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return res.status(400).json({ error: 'userId or Authorization header is required' });
    }

    const sessionInfo = UserService.startScenarioSession(userId, scenarioId);
    res.json(sessionInfo);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Submit user decision in scenario
router.post('/:id/decision', (req: Request, res: Response) => {
  try {
    const scenarioId = String(req.params.id);
    let userId = getUserIdFromReq(req);
    const { actionId, timeTakenSeconds, sessionId } = req.body;

    if (!userId && sessionId) {
      const sessionRow = UserService.getUserStats(sessionId);
    }

    if (!userId || !actionId) {
      return res.status(400).json({ error: 'userId and actionId are required' });
    }

    const result = ScenarioService.submitDecision(
      userId,
      scenarioId,
      actionId,
      timeTakenSeconds !== undefined ? Number(timeTakenSeconds) : 10,
      sessionId
    );

    // Get updated user profile after decision
    const user = UserService.getUserStats(userId);
    const certificates = UserService.getCertificatesForUser(userId);

    res.json({
      ...result,
      user,
      certificates,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
