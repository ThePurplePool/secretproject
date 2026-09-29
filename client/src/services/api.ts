import { Scenario, UserProfile, Certificate, FraudReport, ScamCluster, VoiceCallState } from '../types';

const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api/v1';

function getUserId(): string {
  let uid = localStorage.getItem('antiscam_user_id');
  if (!uid) {
    uid = 'user_' + Math.random().toString(36).substring(2, 10);
    localStorage.setItem('antiscam_user_id', uid);
  }
  return uid;
}

function getToken(): string | null {
  return localStorage.getItem('antiscam_token');
}

function setToken(token: string) {
  localStorage.setItem('antiscam_token', token);
}

function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export const api = {
  getUserId,
  getToken,

  async register(username: string, password?: string): Promise<{ user: UserProfile; certificates: Certificate[]; token: string }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || err.error || 'Ошибка регистрации');
    }
    const data = await res.json();
    if (data.token) setToken(data.token);
    if (data.user?.id) localStorage.setItem('antiscam_user_id', data.user.id);
    return data;
  },

  async login(username: string, password?: string): Promise<{ user: UserProfile; certificates: Certificate[]; token: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || err.error || 'Ошибка входа');
    }
    const data = await res.json();
    if (data.token) setToken(data.token);
    if (data.user?.id) localStorage.setItem('antiscam_user_id', data.user.id);
    return data;
  },

  logout() {
    localStorage.removeItem('antiscam_token');
    localStorage.removeItem('antiscam_user_id');
  },

  async getProfile(username?: string): Promise<{ user: UserProfile; certificates: Certificate[] }> {
    const uid = getUserId();
    const query = new URLSearchParams({ userId: uid });
    if (username) query.append('username', username);
    const res = await fetch(`${API_BASE}/users/${uid}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load profile');
    return res.json();
  },

  async auth(username: string): Promise<{ user: UserProfile; certificates: Certificate[] }> {
    const uid = getUserId();
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId: uid, username }),
    });
    if (!res.ok) throw new Error('Failed to authenticate');
    return res.json();
  },

  async startScenario(scenarioId: string): Promise<{ sessionId: string; startedAt: string; timeLimit: number }> {
    const uid = getUserId();
    const res = await fetch(`${API_BASE}/simulations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ scenarioId, userId: uid }),
    });
    if (!res.ok) throw new Error('Failed to start scenario session');
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
    // Use gateway backward-compatible or versioned endpoint
    const res = await fetch(`/api/scenarios/${scenarioId}/decision`, {
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
      body: JSON.stringify({
        ...data,
        telegramAccount: data.telegramHandle,
        bankCard: data.paymentRequisites,
        userId: uid,
      }),
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
    const res = await fetch(`${API_BASE}/fraud-intelligence/clusters`);
    if (!res.ok) throw new Error('Failed to fetch clusters');
    return res.json();
  },

  async trackInvite(referralCode: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/consultant/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ referralCode }),
    });
    if (!res.ok) throw new Error('Failed to track invite');
    return res.json();
  },

  async verifyCertificate(certId: string): Promise<Certificate> {
    const res = await fetch(`${API_BASE}/certificates/${certId}/verify`);
    if (!res.ok) throw new Error('Certificate not found');
    const data = await res.json();
    return data.certificate || data;
  },

  async getAdminDashboard(): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/stats`);
    if (!res.ok) throw new Error('Failed to fetch admin dashboard');
    return res.json();
  },

  async toggleScenario(id: string): Promise<{ success: boolean; isActive: boolean }> {
    return { success: true, isActive: true };
  },

  async startVoiceCall(scenarioId: string): Promise<VoiceCallState> {
    const res = await fetch(`${API_BASE}/voice/calls/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenarioId }),
    });
    if (!res.ok) throw new Error('Failed to start voice call');
    return res.json();
  },

  async replyVoiceCall(callId: string, replyText: string): Promise<any> {
    const res = await fetch(`${API_BASE}/voice/calls/${callId}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ speechText: replyText }),
    });
    if (!res.ok) throw new Error('Failed to reply to voice call');
    return res.json();
  },
};
