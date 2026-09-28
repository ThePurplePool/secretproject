import { Router, Request, Response } from 'express';
import { db } from '../db/database';
import { ScenarioService } from '../services/scenarioService';
import { ReportService } from '../services/reportService';
import { Scenario } from '../models/types';

const router = Router();

// Admin Dashboard aggregated stats
router.get('/dashboard', (_req: Request, res: Response) => {
  try {
    const userCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as any).count;
    const completedSessionsCount = (db.prepare('SELECT COUNT(*) as count FROM scenario_sessions').get() as any).count;
    const activeScenariosCount = (db.prepare('SELECT COUNT(*) as count FROM scenarios WHERE is_active = 1').get() as any).count;

    const lossStats = (db.prepare('SELECT SUM(simulated_loss) as totalLoss, AVG(time_taken_seconds) as avgTime FROM scenario_sessions').get() as any);
    const errorStats = (db.prepare('SELECT COUNT(*) as errorCount FROM scenario_sessions WHERE is_success = 0').get() as any);

    const reportsCount = (db.prepare('SELECT COUNT(*) as count FROM fraud_reports').get() as any).count;
    const clustersCount = (db.prepare('SELECT COUNT(*) as count FROM scam_clusters').get() as any).count;
    const certificatesCount = (db.prepare('SELECT COUNT(*) as count FROM certificates').get() as any).count;

    const certificatesList = db.prepare('SELECT * FROM certificates ORDER BY issued_at DESC LIMIT 10').all();
    const recentReports = ReportService.getAllReports().slice(0, 10);
    const clusters = ReportService.getAllClusters().slice(0, 10);

    res.json({
      metrics: {
        totalUsers: userCount,
        completedScenarios: completedSessionsCount,
        activeScenarios: activeScenariosCount,
        totalSimulatedLoss: lossStats.totalLoss || 0,
        averageResponseTime: Number((lossStats.avgTime || 0).toFixed(1)),
        totalMistakes: errorStats.errorCount || 0,
        mistakeRate: completedSessionsCount > 0 ? Number(((errorStats.errorCount / completedSessionsCount) * 100).toFixed(1)) : 0,
        totalReports: reportsCount,
        totalScamClusters: clustersCount,
        totalCertificatesIssued: certificatesCount,
      },
      recentReports,
      clusters,
      certificatesList,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin get all scenarios including inactive
router.get('/scenarios', (_req: Request, res: Response) => {
  try {
    const scenarios = ScenarioService.getAllScenarios(false);
    res.json(scenarios);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin save or update scenario
router.post('/scenarios', (req: Request, res: Response) => {
  try {
    const scenario: Scenario = req.body;
    if (!scenario.id || !scenario.title) {
      return res.status(400).json({ error: 'Scenario id and title are required' });
    }

    ScenarioService.saveScenario(scenario);
    res.json({ success: true, scenario });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin toggle active status of scenario
router.patch('/scenarios/:id/toggle', (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const scenario = ScenarioService.getScenarioById(id);
    if (!scenario) {
      return res.status(404).json({ error: 'Сценарий не найден' });
    }

    const newStatus = scenario.isActive ? 0 : 1;
    db.prepare('UPDATE scenarios SET is_active = ? WHERE id = ?').run(newStatus, id);
    res.json({ success: true, isActive: newStatus === 1 });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin update report status
router.patch('/reports/:id/status', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    db.prepare('UPDATE fraud_reports SET status = ? WHERE id = ?').run(status, id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
