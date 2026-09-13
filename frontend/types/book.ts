export type BookProcessingStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "validation_required"
  | "ready";

export interface Book {
  id: string;
  filename: string;
  mime_type: string;
  file_size: number;
  title: string | null;
  author: string | null;
  description: string | null;
  isbn: string | null;
  publication_year: number | null;
  cover_url: string | null;
  tags: string[];
  processing_status: BookProcessingStatus | string;
  created_at: string;
  updated_at: string;
  processing_stage?: string | null;
  processing_metrics?: Record<string, unknown>;
  processing_error?: {
    code?: string | null;
    message?: string | null;
    details?: Record<string, unknown>;
  } | null;

  color?: string;
  newlyShelved?: boolean;
  readingSessionIds?: string[];
}

export interface BookMetadata {
  title: string | null;
  author: string | null;
  description: string | null;
  isbn: string | null;
  publication_year: number | null;
  cover_url: string | null;
  tags: string[];
}