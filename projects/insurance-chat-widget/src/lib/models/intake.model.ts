/**
 * Models for medical document intake and extraction functionality
 */

export interface CandidateCondition {
  id: string;
  originalTerm: string;
  canonical: {
    code: string;
    label: string;
  };
  confidence: number;
  status?: 'active' | 'resolved';
  severity?: string;
  onsetDate?: string;
  evidence: Evidence;
}

export interface Evidence {
  docId: string;
  page: number;
  snippet: string; // Redacted text snippet
  rawSnippet?: string; // Unredacted (for preview with warning)
}

export interface ExtractionSummary {
  sessionId: string;
  candidates: CandidateCondition[];
  extractionStatus: 'processing' | 'completed' | 'failed';
  extractedAt?: string;
  error?: string;
}

export interface ConfirmationPayload {
  sessionId: string;
  confirmed: ConfirmedCondition[];
  rejected: string[]; // Array of candidate IDs
  manualAdd?: ManualCondition[];
}

export interface ConfirmedCondition {
  candidateId: string;
  status?: 'active' | 'resolved';
  severity?: string;
  onsetDate?: string;
}

export interface ManualCondition {
  code: string;
  label: string;
  status?: 'active' | 'resolved';
  severity?: string;
  onsetDate?: string;
}

export interface ConfirmationResponse {
  prefill: PrefillAnswer[];
  confirmedCount: number;
  rejectedCount: number;
}

export interface PrefillAnswer {
  questionId: string;
  answer: string | string[];
  source: 'prefill';
  evidenceRefs: string[]; // Format: "fileId:pageNumber"
}

export interface DictionarySearchResult {
  code: string;
  label: string;
  synonyms: string[];
}

