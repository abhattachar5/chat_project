export interface WidgetConfig {
  jwt: string;
  tenantId: string;
  applicationId: string;
  environment: 'prod' | 'staging' | 'dev';
  apiBaseUrl?: string; // Optional custom API base URL (overrides environment defaults)
  locale?: string;
  theme?: ThemeConfig;
  features?: FeatureConfig;
  analytics?: (event: AnalyticsEvent) => void;
  mount?: string; // Optional selector for custom mount point
}

export interface ThemeConfig {
  palette?: {
    primary?: string;
    secondary?: string;
    error?: string;
    surface?: string;
  };
  density?: 'comfortable' | 'compact';
  darkMode?: boolean;
}

export interface FeatureConfig {
  voice?: boolean;
  showProgress?: boolean;
  allowBackNav?: boolean; // Rules-driven, default false
}

export interface AnalyticsEvent {
  event: string;
  sessionId?: string;
  questionId?: string;
  inputMode?: 'text' | 'voice' | 'file';
  latency_ms?: number;
  timestamp: string;
  [key: string]: unknown;
}

export interface StartSessionRequest {
  tenantId: string;
  applicationId: string;
  locale: string;
  theme?: ThemeConfig;
  consent: {
    recordingAccepted: boolean;
    timestamp: string;
  };
}

export interface Session {
  id: string;
  status: 'active' | 'completed' | 'canceled';
  createdAt: string;
  locale: string;
  progress?: number; // 0..1
}

export interface Question {
  id: string;
  type: 'text' | 'number' | 'date' | 'selectOne' | 'selectMany' | 'address' | 'consent' | 'file' | 'signature';
  prompt: string;
  helpText?: string;
  options?: Option[];
  constraints?: QuestionConstraints;
}

export interface Option {
  value: string;
  label: string;
}

export interface QuestionConstraints {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  mask?: string;
  sensitive?: boolean;
}

export interface QuestionEnvelope {
  sessionId?: string; // Optional as it might not always be provided
  question: Question | null;
  ttsHint?: string;
  isTerminal?: boolean;
  progress?: number; // Progress from backend (0..1)
  decision?: string; // Decision for terminal questions
  decisionReason?: string; // Reason for decision
}

export interface AnswerEnvelope {
  questionId: string;
  answer: string | number | boolean | string[] | Record<string, unknown>;
  inputMode: 'text' | 'voice' | 'file';
  timestamp: string;
  meta?: {
    asrConfidence?: number;
    rawAudioRef?: string;
  };
}

export interface TranscriptItem {
  role: 'system' | 'widget' | 'user' | 'rules';
  text: string;
  redacted?: boolean;
  timestamp: string;
}

export interface Transcript {
  sessionId: string;
  items: TranscriptItem[];
}

export interface ValidationError {
  code: string;
  message: string;
  fieldErrors?: Array<{
    questionId: string;
    message: string;
  }>;
}

