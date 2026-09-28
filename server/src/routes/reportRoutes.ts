import { Router, Request, Response } from 'express';
import { ReportService } from '../services/reportService';

const router = Router();

// Submit fraud report
router.post('/', (req: Request, res: Response) => {
  try {
    const {
      userId,
      category = req.body.scamType || 'phone_call',
      phoneNumber = req.body.scammerPhone,
      telegramHandle,
      whatsappHandle,
      url = req.body.fakeUrl,
      paymentRequisites,
      description,
      screenshotUrl,
    } = req.body;

    if (!category || !description) {
      return res.status(400).json({ error: 'Категория и описание обязательны для заполнения' });
    }

    const result = ReportService.createReport({
      userId,
      category,
      phoneNumber,
      telegramHandle,
      whatsappHandle,
      url,
      paymentRequisites,
      description,
      screenshotUrl,
    });

    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// List all reports (admin / intelligence view)
router.get('/', (_req: Request, res: Response) => {
  try {
    const reports = ReportService.getAllReports();
    res.json(reports);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// List all scam clusters
router.get('/clusters', (_req: Request, res: Response) => {
  try {
    const clusters = ReportService.getAllClusters();
    res.json(clusters);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
