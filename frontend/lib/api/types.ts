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
  processing_status: string;
  created_at: string;
  updated_at: string;
}

export interface BookMetadata {
  id: string;
  title: string | null;
  author: string | null;
  description: string | null;
  isbn: string | null;
  publication_year: number | null;
  cover_url: string | null;
  tags: string[];
  processing_status: string;
  processing_run_status: string;
}

export interface BookMetadataUpdate {
  title?: string | null;
  author?: string | null;
  description?: string | null;
  isbn?: string | null;
  publication_year?: number | null;
  cover_url?: string | null;
  tags?: string[];
}

export interface ProcessingRunError {
  code: string | null;
  message: string | null;
  details: Record<string, unknown>;
}

export interface ProcessingRun {
  processing_run_id: string;
  status: string;
  stage: string | null;
  metrics: Record<string, unknown>;
  error: ProcessingRunError | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}
