export type MessageRole = 'assistant' | 'user' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  questionId?: string;
  sensitive?: boolean;
}

export interface MessageDisplay {
  message: ChatMessage;
  showTimestamp: boolean;
  isRedacted: boolean;
}

