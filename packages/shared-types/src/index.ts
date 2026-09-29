// packages/shared-types/src/index.ts
// Shared DTOs, Enums, and Contracts (No business logic)

export type UserRole = 'USER' | 'CONSULTANT' | 'ADMIN' | 'ANALYST' | 'SUPER_ADMIN';

export type UserLevel = 1 | 2 | 3;

export interface UserProfileDTO {
  id: string;
  username: string;
  role: UserRole;
  level: UserLevel;
  levelName: string;
  currentBalance: number;
  initialBalance: number;
  totalLoss: number;
  scenariosCompleted: number;
  scenariosFailed: number;
  scenariosTotal: number;
  referralCode?: string;
  invitedCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ScenarioActionDTO {
  id: string;
  label: string;
  type: 'safe' | 'dangerous' | 'verify' | 'report' | 'critical_danger';
  isSafe: boolean;
  order: number;
}

export interface ConsequenceOutcomeDTO {
  isDangerous: boolean;
  amountLost: number;
  consequences: string[];
  explanation: string;
  goldenRule: string;
  recommendations: string[];
  technicalIndicators?: string[];
  recoverySteps?: string[];
}

export interface ScenarioContentDTO {
  text: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  pressurePhrase?: string;
  attachment?: {
    name: string;
    size: string;
    type: string;
    suspiciousIndicators: string[];
  };
  link?: {
    url: string;
    displayUrl: string;
    targetDomain: string;
    isPhishing: boolean;
  };
  callMetadata?: {
    callerId: string;
    callerName: string;
    department: string;
    recordedDuration: string;
  };
}

export interface ScenarioDTO {
  id: string;
  title: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  level: number;
  timeLimit: number; // in seconds
  interface: 'telegram' | 'sms' | 'email' | 'browser' | 'banking' | 'social' | 'delivery' | 'call';
  sender: {
    name: string;
    address: string;
    verifiedBadge?: boolean;
    status?: string;
  };
  content: ScenarioContentDTO;
  availableActions: ScenarioActionDTO[];
  warningSigns: string[];
  learningObjective: string;
  psychologicalTriggers: string[];
  simulatedLossAmount: number;
  tags?: string[];
}

export interface SimulationSessionDTO {
  id: string;
  userId: string;
  scenarioId: string;
  startedAt: string;
  expiresAt: string;
  timeLimitSeconds: number;
  status: 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'ABANDONED';
  completedAt?: string;
  selectedActionId?: string;
  isSafe?: boolean;
  simulatedLoss?: number;
}

export interface CertificateDTO {
  id: string;
  userId: string;
  username: string;
  level: UserLevel;
  levelName: string;
  title: string;
  issuedAt: string;
  verificationHash: string;
  qrPayload: string;
  skillsVerified: string[];
  isRevoked: boolean;
}

export interface FraudReportDTO {
  id: string;
  userId?: string;
  phoneNumber?: string;
  telegramAccount?: string;
  url?: string;
  bankCard?: string;
  description: string;
  category: string;
  status: 'SUBMITTED' | 'ANALYZING' | 'CLUSTERED' | 'VERIFIED';
  screenshotUrl?: string;
  createdAt: string;
}

export interface ScamClusterDTO {
  id: string;
  primaryIdentifier: string;
  type: 'phone' | 'telegram' | 'url' | 'card';
  reportsCount: number;
  firstSeen: string;
  lastSeen: string;
  confidenceScore: number;
  associatedEntities: {
    phones: string[];
    telegramAccounts: string[];
    urls: string[];
    cards: string[];
  };
  threatLevel: 'medium' | 'high' | 'critical';
}

export interface ConsultantAssessmentDTO {
  id: string;
  userId: string;
  scenarioId: string;
  q1WhatHappened: string;
  q2SuspiciousSigns: string;
  q3ActionNeeded: string;
  score: number;
  feedback: string;
  isPassed: boolean;
  submittedAt: string;
}

export type EventType =
  | 'USER_REGISTERED'
  | 'SIMULATION_STARTED'
  | 'SIMULATION_COMPLETED'
  | 'SCENARIO_FAILED'
  | 'SCENARIO_PASSED'
  | 'LEVEL_COMPLETED'
  | 'CONSULTANT_CERTIFIED'
  | 'FRAUD_REPORTED'
  | 'SCAM_CLUSTER_UPDATED'
  | 'CERTIFICATE_ISSUED'
  | 'VOICE_SESSION_COMPLETED';

export interface AppEvent<T = any> {
  id: string;
  type: EventType;
  timestamp: string;
  correlationId: string;
  sourceService: string;
  payload: T;
}

export interface NormalizedErrorResponse {
  error: {
    code: string;
    message: string;
    requestId: string;
    timestamp?: string;
    details?: any;
  };
}
