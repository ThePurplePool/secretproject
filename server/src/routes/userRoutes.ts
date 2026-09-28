import { Router, Request, Response } from 'express';
import { UserService } from '../services/userService';

const router = Router();

// Helper to extract bearer token
function getToken(req: Request): string | undefined {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return undefined;
}

// Register with username and password
router.post('/register', (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username) {
      return res.status(400).json({ error: 'Имя пользователя обязательно' });
    }

    const result = UserService.register(username, password);
    const certificates = UserService.getCertificatesForUser(result.user.id);

    res.status(201).json({
      user: result.user,
      token: result.token,
      sessionToken: result.token,
      certificates,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Login with username and password
router.post('/login', (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username) {
      return res.status(400).json({ error: 'Имя пользователя обязательно' });
    }

    const result = UserService.login(username, password);
    const certificates = UserService.getCertificatesForUser(result.user.id);

    res.json({
      user: result.user,
      token: result.token,
      sessionToken: result.token,
      certificates,
    });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

// Get current profile
router.get('/profile', (req: Request, res: Response) => {
  try {
    const token = getToken(req);
    let user = token ? UserService.getUserByToken(token) : null;

    if (!user) {
      const userId = (req.query.userId as string) || (req.headers['x-user-id'] as string);
      const username = req.query.username as string;
      user = UserService.getOrCreateUser(userId, username);
    }

    const certificates = UserService.getCertificatesForUser(user.id);

    res.json({
      user,
      certificates,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Authenticate / login or create account (quick start compatibility)
router.post('/auth', (req: Request, res: Response) => {
  try {
    const { userId, username } = req.body;
    const user = UserService.getOrCreateUser(userId, username);
    const certificates = UserService.getCertificatesForUser(user.id);

    res.json({
      user,
      certificates,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Track referral / community invitation
router.post('/invite', (req: Request, res: Response) => {
  try {
    const { referralCode } = req.body;
    if (!referralCode) {
      return res.status(400).json({ error: 'Referral code is required' });
    }

    const success = UserService.trackInvite(referralCode);
    res.json({ success });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Consultant structured case review (AC-CONSULT-03)
router.post('/consultant/review', (req: Request, res: Response) => {
  try {
    const token = getToken(req);
    const user = token ? UserService.getUserByToken(token) : null;
    const userId = user ? user.id : ((req.headers['x-user-id'] as string) || req.body.userId);

    if (!userId) {
      return res.status(401).json({ error: 'Требуется авторизация для отправки экспертного разбора' });
    }

    const { caseId, analysisText, actionPlan, preventionRule } = req.body;
    if (!analysisText || !actionPlan || !preventionRule) {
      return res.status(400).json({ error: 'Все 3 поля структурированного отчёта обязательны' });
    }

    const result = UserService.submitConsultantReview(
      userId,
      caseId || 'consultant-case-001',
      analysisText,
      actionPlan,
      preventionRule
    );

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Public certificate verification (AC-CERT-03)
router.get(['/certificates/:certId', '/certificates/verify/:certId'], (req: Request, res: Response) => {
  try {
    const cert = UserService.verifyCertificate(String(req.params.certId));
    if (!cert) {
      return res.status(404).json({ error: 'Сертификат не найден', verified: false });
    }
    res.json({
      verified: true,
      certificate: cert,
      ...cert,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
