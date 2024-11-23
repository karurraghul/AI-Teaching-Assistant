// types/api.ts
export interface SessionValidationResponse {
  isValid: boolean;
  hasDeepgram?: boolean;
  hasGroq?: boolean;
}

export interface AudioProcessingResponse {
  success: boolean;
  transcript: string;
  notes_file: string | null;
  message: string;
  quiz: { questions: any[] };
}

export interface ErrorResponse {
  detail: string;
  status: number;
}

export interface SessionResponse {
  success: boolean;
  message: string;
}

export interface ApiKeys {
  deepgramKey: string;
  groqKey: string;
}

export interface ApiKeyVerificationResponse {
  success: boolean;
  error?: string;
  message?: string;
}

export interface ApiKeyModalProps {
  onKeysSubmitted: () => void | Promise<void>;
}

export interface SecureSessionKeys {
  deepgramKey: string | null;
  groqKey: string | null;
  timestamp?: number;
}