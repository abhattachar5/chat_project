/**
 * Models for medical document upload functionality
 */

export interface UploadFile {
  id: string;
  file: File;
  status: 'queued' | 'uploading' | 'scanning' | 'extracted' | 'failed';
  progress: number;
  fileId?: string;
  error?: string;
  uploadedAt?: Date;
}

export interface UploadResponse {
  fileId: string;
  status: 'uploaded' | 'processing' | 'failed';
  message?: string;
}

export interface FileValidationResult {
  valid: boolean;
  errors: string[];
}

export interface FileRequirements {
  maxSize: number; // in bytes (20MB = 20 * 1024 * 1024)
  maxFiles: number; // maximum 5 files
  allowedTypes: string[]; // ['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
}

