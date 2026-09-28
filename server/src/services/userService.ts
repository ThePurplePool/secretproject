import { db } from '../db/database';
import { UserProfile, Certificate } from '../models/types';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export class UserService {
  public static getOrCreateUser(userId?: string, username?: string): UserProfile {
    let userRow: any;

    if (userId) {
      userRow = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    }

    if (!userRow) {
      const newId = userId || uuidv4();
      const newUsername = username || `Гражданин_${Math.floor(1000 + Math.random() * 9000)}`;
      const referralCode = `UZ-SCAM-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      db.prepare(`
        INSERT INTO users (id, username, initial_balance, current_balance, simulated_loss, protected_amount, level, invited_count, referral_code)
        VALUES (?, ?, 10000000, 10000000, 0, 10000000, 1, 0, ?)
      `).run(newId, newUsername, referralCode);

      userRow = db.prepare('SELECT * FROM users WHERE id = ?').get(newId);
    }

    return this.getUserStats(userRow.id);
  }

  public static getUserStats(userId: string): UserProfile {
    const userRow = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
    if (!userRow) {
      throw new Error(`User not found: ${userId}`);
    }

    const sessions = db.prepare('SELECT * FROM scenario_sessions WHERE user_id = ?').all(userId) as any[];
    const totalScenariosRow = db.prepare('SELECT COUNT(*) as count FROM scenarios WHERE is_active = 1').get() as { count: number };

    const totalSessions = sessions.length;
    const successSessions = sessions.filter((s) => s.is_success === 1).length;
    const errorCount = totalSessions - successSessions;

    const avgResponseTime =
      totalSessions > 0
        ? Number((sessions.reduce((acc, s) => acc + s.time_taken_seconds, 0) / totalSessions).toFixed(1))
        : 0;

    // Check certificate issuance and level upgrade
    this.evaluateCertificatesAndLevel(userId, userRow.username, sessions);

    // Refresh row after level check
    const refreshedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;

    const levelNames: Record<number, 'Anti-Scam Basic' | 'Anti-Scam Defender' | 'Anti-Scam Consultant'> = {
      1: 'Anti-Scam Basic',
      2: 'Anti-Scam Defender',
      3: 'Anti-Scam Consultant',
    };

    return {
      id: refreshedUser.id,
      username: refreshedUser.username,
      email: refreshedUser.email || undefined,
      initialBalance: refreshedUser.initial_balance,
      currentBalance: refreshedUser.current_balance,
      simulatedLoss: refreshedUser.simulated_loss,
      protectedAmount: refreshedUser.protected_amount,
      level: refreshedUser.level,
      levelName: levelNames[refreshedUser.level] || 'Anti-Scam Basic',
      scenariosCompleted: totalSessions,
      scenariosTotal: totalScenariosRow.count,
      averageResponseTime: avgResponseTime,
      errorCount,
      successCount: successSessions,
      invitedCount: refreshedUser.invited_count || 0,
      referralCode: refreshedUser.referral_code,
    };
  }

  public static trackInvite(referralCode: string): boolean {
    const user = db.prepare('SELECT id FROM users WHERE referral_code = ?').get(referralCode) as any;
    if (!user) return false;

    db.prepare('UPDATE users SET invited_count = invited_count + 1 WHERE id = ?').run(user.id);
    return true;
  }

  public static getCertificatesForUser(userId: string): Certificate[] {
    const rows = db.prepare('SELECT * FROM certificates WHERE user_id = ? ORDER BY level_number ASC').all(userId) as any[];
    return rows.map((r) => ({
      id: r.id,
      certificateId: r.certificate_id,
      userId: r.user_id,
      userName: r.user_name,
      levelNumber: r.level_number,
      levelName: r.level_name,
      issuedAt: r.issued_at,
      verificationHash: r.verification_hash,
    }));
  }

  public static verifyCertificate(certId: string): Certificate | null {
    const r = db.prepare('SELECT * FROM certificates WHERE certificate_id = ?').get(certId) as any;
    if (!r) return null;
    return {
      id: r.id,
      certificateId: r.certificate_id,
      userId: r.user_id,
      userName: r.user_name,
      levelNumber: r.level_number,
      levelName: r.level_name,
      issuedAt: r.issued_at,
      verificationHash: r.verification_hash,
    };
  }

  private static evaluateCertificatesAndLevel(userId: string, username: string, sessions: any[]) {
    const successfulScenarioIds = new Set(sessions.filter((s) => s.is_success === 1).map((s) => s.scenario_id));

    // Scenarios by level
    const level1Passed = Array.from(successfulScenarioIds).filter((id) =>
      ['fake-bank-telegram-001', 'fake-bank-sms-002', 'fake-gov-email-003', 'fake-police-call-004'].includes(id)
    ).length;

    const level2Passed = Array.from(successfulScenarioIds).filter((id) =>
      ['fake-relative-005', 'fake-delivery-sms-006', 'fake-investment-007', 'fake-job-008'].includes(id)
    ).length;

    const level3Passed = Array.from(successfulScenarioIds).filter((id) =>
      ['phishing-browser-009', 'malicious-apk-010'].includes(id)
    ).length;

    // Issue Level 1 Certificate
    if (level1Passed >= 2) {
      this.ensureCertificate(userId, username, 1, 'Anti-Scam Basic');
      db.prepare('UPDATE users SET level = MAX(level, 2) WHERE id = ?').run(userId);
    }

    // Issue Level 2 Certificate
    if (level2Passed >= 2) {
      this.ensureCertificate(userId, username, 2, 'Anti-Scam Defender');
      db.prepare('UPDATE users SET level = MAX(level, 3) WHERE id = ?').run(userId);
    }

    // Issue Level 3 Certificate
    if (level3Passed >= 1) {
      this.ensureCertificate(userId, username, 3, 'Anti-Scam Consultant');
    }
  }

  private static ensureCertificate(userId: string, username: string, levelNumber: number, levelName: string) {
    const existing = db.prepare('SELECT id FROM certificates WHERE user_id = ? AND level_number = ?').get(userId, levelNumber);
    if (!existing) {
      const certId = `CERT-UZ-${levelNumber}-${Math.floor(100000 + Math.random() * 900000)}`;
      const hash = crypto.createHash('sha256').update(`${certId}-${userId}-${levelName}-${Date.now()}`).digest('hex').substring(0, 16);
      db.prepare(`
        INSERT INTO certificates (id, certificate_id, user_id, user_name, level_number, level_name, verification_hash)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(uuidv4(), certId, userId, username, levelNumber, levelName, hash);
    }
  }
}
