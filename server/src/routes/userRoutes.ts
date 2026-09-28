import { Router, Request, Response } from 'express';
import { UserService } from '../services/userService';

const router = Router();

// Get current profile or create by id/username
router.get('/profile', (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || (req.headers['x-user-id'] as string);
    const username = req.query.username as string;
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

// Authenticate / login or create account
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

// Public certificate verification
router.get('/certificates/:certId', (req: Request, res: Response) => {
  try {
    const cert = UserService.verifyCertificate(String(req.params.certId));
    if (!cert) {
      return res.status(404).json({ error: 'Сертификат не найден' });
    }
    res.json(cert);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
