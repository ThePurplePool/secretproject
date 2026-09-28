import { Scenario, UserProfile, Certificate, FraudReport, ScamCluster, VoiceCallState } from '../types';

const API_BASE = '/api';

function getUserId(): string {
  let uid = localStorage.getItem('antiscam_user_id');
  if (!uid) {
    uid = 'user_' + Math.random().toString(36).substring(2, 10);
    localStorage.setItem('antiscam_user_id', uid);
  }
  return uid;
}

export const api = {
  getUserId,

  async getProfile(username?: string): Promise<{ user: UserProfile; certificates: Certificate[] }> {
    const uid = getUserId();
    const query = new URLSearchParams({ userId: uid });
    if (username) query.append('username', username);
    const res = await fetch(`${API_BASE}/user/profile?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to load profile');
    return res.json();
  },

  async auth(username: string): Promise<{ user: UserProfile; certificates: Certificate[] }> {
    const uid = getUserId();
    const res = await fetch(`${API_BASE}/user/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: uid, username }),
    });
    if (!res.ok) throw new Error('Failed to authenticate');
    return res.json();
  },

  async getScenarios(level?: number): Promise<Scenario[]> {
    const url = level ? `${API_BASE}/scenarios?level=${level}` : `${API_BASE}/scenarios`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to load scenarios');
    return res.json();
  },

  async getScenario(id: string): Promise<Scenario> {
    const res = await fetch(`${API_BASE}/scenarios/${id}`);
    if (!res.ok) throw new Error('Failed to load scenario');
    return res.json();
  },

  async submitDecision(
    scenarioId: string,
    actionId: string,
    timeTakenSeconds: number
  ): Promise<{
    action: any;
    consequence: any;
    isSuccess: boolean;
    simulatedLoss: number;
    feedback: any;
    retryScenarioId?: string;
    user: UserProfile;
    certificates: Certificate[];
  }> {
    const uid = getUserId();
    const res = await fetch(`${API_BASE}/scenarios/${scenarioId}/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: uid, actionId, timeTakenSeconds }),
    });
    if (!res.ok) throw new Error('Failed to submit decision');
    return res.json();
  },

  async submitReport(data: {
    category: string;
    phoneNumber?: string;
    telegramHandle?: string;
    whatsappHandle?: string;
    url?: string;
    paymentRequisites?: string;
    description: string;
    screenshotUrl?: string;
  }): Promise<{ report: FraudReport; cluster?: ScamCluster; message: string }> {
    const uid = getUserId();
    const res = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, userId: uid }),
    });
    if (!res.ok) throw new Error('Failed to submit report');
    return res.json();
  },

  async getReports(): Promise<FraudReport[]> {
    const res = await fetch(`${API_BASE}/reports`);
    if (!res.ok) throw new Error('Failed to fetch reports');
    return res.json();
  },

  async getClusters(): Promise<ScamCluster[]> {
    const res = await fetch(`${API_BASE}/reports/clusters`);
    if (!res.ok) throw new Error('Failed to fetch clusters');
    return res.json();
  },

  async trackInvite(referralCode: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/user/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ referralCode }),
    });
    if (!res.ok) throw new Error('Failed to track invite');
    return res.json();
  },

  async verifyCertificate(certId: string): Promise<Certificate> {
    const res = await fetch(`${API_BASE}/user/certificates/${certId}`);
    if (!res.ok) throw new Error('Certificate not found');
    return res.json();
  },

  async getAdminDashboard(): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/dashboard`);
    if (!res.ok) throw new Error('Failed to fetch admin dashboard');
    return res.json();
  },

  async toggleScenario(id: string): Promise<{ success: boolean; isActive: boolean }> {
    const res = await fetch(`${API_BASE}/admin/scenarios/${id}/toggle`, {
      method: 'PATCH',
    });
    if (!res.ok) throw new Error('Failed to toggle scenario');
    return res.json();
  },

  async startVoiceCall(scenarioId: string): Promise<VoiceCallState> {
    const res = await fetch(`${API_BASE}/voice/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenarioId }),
    });
    if (!res.ok) throw new Error('Failed to start voice call');
    return res.json();
  },

  async replyVoiceCall(callId: string, replyId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/voice/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callId, replyId }),
    });
    if (!res.ok) throw new Error('Failed to reply to voice call');
    return res.json();
  },
};
