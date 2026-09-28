export type InterfaceType =
  | 'telegram'
  | 'sms'
  | 'email'
  | 'browser'
  | 'banking'
  | 'social'
  | 'delivery'
  | 'call';

export type ConsequenceType =
  | 'FINANCIAL_LOSS'
  | 'DATA_LOSS'
  | 'ACCOUNT_COMPROMISE'
  | 'DEVICE_COMPROMISE'
  | 'IDENTITY_RISK'
  | 'PRIVACY_RISK'
  | 'CREDENTIAL_EXPOSURE'
  | 'OTP_EXPOSURE';

export type ActionDangerType = 'critical_danger' | 'warning' | 'safe' | 'report';

export interface ScenarioAction {
  id: string;
  label: string;
  type: ActionDangerType;
  isCorrect: boolean;
  consequenceId: string;
  explanationNote: string;
}

export interface ConsequenceOutcome {
  title: string;
  chain: string[];
  types: ConsequenceType[];
  simulatedLoss: number;
  summary: string;
}

export interface ScenarioPressurePhrase {
  atSecondsRemaining: number;
  text: string;
}

export interface ScenarioFeedback {
  userActionSummary: string;
  whyDangerous: string;
  psychologicalTricks: string[];
  suspiciousIndicators: string[];
  correctActionAdvice: string;
  realLifeRule: string;
}

export interface ScenarioSender {
  name: string;
  handleOrPhone: string;
  avatarUrl?: string;
  verified?: boolean;
  status?: string;
  officialDomain?: string;
}

export interface ScenarioContent {
  text?: string;
  attachment?: {
    name: string;
    size: string;
    type: string;
    warningFlags?: string[];
  };
  url?: string;
  displayUrl?: string;
  emailSubject?: string;
  bankingNotice?: {
    accountMask?: string;
    amount?: string;
    reason?: string;
  };
  callDetails?: {
    callerName: string;
    callerNumber: string;
    simulatedAudioText: string;
    callerMood: string;
  };
  consultantCase?: {
    victimName: string;
    relationship: string;
    messageReceived: string;
    dilemma: string;
  };
}

export interface Scenario {
  id: string;
  title: string;
  category: 'phishing' | 'malware' | 'financial' | 'social_engineering' | 'impersonation';
  difficulty: 1 | 2 | 3;
  level: 1 | 2 | 3; // 1: Recognize, 2: Defend, 3: Consultant
  interface: InterfaceType;
  timeLimit: number; // in seconds
  startingBalance: number;
  sender: ScenarioSender;
  content: ScenarioContent;
  pressurePhrases: ScenarioPressurePhrase[];
  availableActions: ScenarioAction[];
  consequences: Record<string, ConsequenceOutcome>;
  feedback: ScenarioFeedback;
  retryScenarioId?: string;
  timeoutActionId?: string;
  isActive: boolean;
}

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  initialBalance: number;
  currentBalance: number;
  simulatedLoss: number;
  protectedAmount: number;
  level: number;
  levelName: 'Anti-Scam Basic' | 'Anti-Scam Defender' | 'Anti-Scam Consultant';
  scenariosCompleted: number;
  scenariosTotal: number;
  averageResponseTime: number;
  errorCount: number;
  successCount: number;
  invitedCount: number;
  referralCode: string;
}

export interface Certificate {
  id: string;
  certificateId: string;
  userId: string;
  userName: string;
  levelNumber: number;
  levelName: string;
  issuedAt: string;
  verificationHash: string;
}

export interface FraudReport {
  id: string;
  reportId: string;
  userId?: string;
  category: string;
  phoneNumber?: string;
  telegramHandle?: string;
  whatsappHandle?: string;
  url?: string;
  paymentRequisites?: string;
  description: string;
  screenshotUrl?: string;
  status: 'new' | 'investigating' | 'confirmed_cluster' | 'archived';
  scamClusterId?: string;
  createdAt: string;
}

export interface ScamCluster {
  id: string;
  clusterCode: string;
  title: string;
  indicatorsSummary: string;
  reportCount: number;
  confidenceScore: number;
  status: 'active' | 'mitigated' | 'monitoring';
  matchedPhones: string[];
  matchedTelegrams: string[];
  matchedUrls: string[];
  matchedRequisites: string[];
  createdAt: string;
  updatedAt: string;
}

export interface VoiceCallState {
  callId: string;
  scenarioId: string;
  callerName: string;
  callerNumber: string;
  stage: number;
  currentAudioScript: string;
  urgencyLevel: 'moderate' | 'high' | 'extreme';
  availableUserReplies: Array<{
    id: string;
    text: string;
    consequenceId: string;
    isSafe: boolean;
  }>;
}

export interface VoiceProvider {
  name: string;
  initializeCall(scenarioId: string): Promise<VoiceCallState>;
  processReply(callId: string, replyId: string): Promise<{
    nextScript?: string;
    isCallEnded: boolean;
    consequenceId?: string;
    urgencyLevel: 'moderate' | 'high' | 'extreme';
  }>;
}
