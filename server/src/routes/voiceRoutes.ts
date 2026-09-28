import { Router, Request, Response } from 'express';
import { defaultVoiceProvider } from '../services/voiceService';

const router = Router();

// Start AI Voice simulation call
router.post('/start', async (req: Request, res: Response) => {
  try {
    const { scenarioId } = req.body;
    if (!scenarioId) {
      return res.status(400).json({ error: 'scenarioId is required' });
    }

    const callState = await defaultVoiceProvider.initializeCall(scenarioId);
    res.json(callState);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Process voice reply
router.post('/reply', async (req: Request, res: Response) => {
  try {
    const { callId, replyId } = req.body;
    if (!callId || !replyId) {
      return res.status(400).json({ error: 'callId and replyId are required' });
    }

    const result = await defaultVoiceProvider.processReply(callId, replyId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
