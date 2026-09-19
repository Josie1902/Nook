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

export interface UpdateSessionRequest {
  topic: string;
}

export interface AddBookRequest {
  book_id: string;
}

export interface Session {
  id: string;
  topic: string;
  mode: string;
  created_at: string;
}

export interface SessionBook {
  book_id: string;
  added_at: string;
  title: string;
  author: string;
  cover_url: string | null;
}

export interface ResearchSelectionBook {
  book_id: string;
  title: string;
  author: string;
  reason: string;
  selected: boolean;
}

export interface ResearchSelectionResponse {
  mode: string;
  topic: string;
  description: string;
  books: ResearchSelectionBook[];
}

export interface ResearchRequest {
  input: string;
}

export interface ResearchRefineRequest {
  topic: string;
  description: string;
  book_ids?: string[];
  comments?: string | null;
}

export interface ResearchConfirmRequest {
  topic: string;
  description: string;
  book_ids?: string[];
}

export interface SessionDetail {
  id: string;
  topic: string;
  mode: string;
  description: string;
  created_at: string;
  books: SessionBook[];
}

export interface UserMessageContent {
  text: string;
}

export interface AssistantMessageSegment {
  text: string;
  citation_ids: string[];
}

export interface AssistantMessageContent {
  segments: AssistantMessageSegment[];
  citations: CitationResponse[];
}

export interface UserMessageResponse {
  id: string;
  role: "user";
  content: UserMessageContent;
  error_message: string | null;
  created_at: string;
}

export interface AssistantMessageResponse {
  id: string;
  role: "assistant";
  content: AssistantMessageContent;
  error_message: string | null;
  created_at: string;
}

export type MessageResponse =
  | UserMessageResponse
  | AssistantMessageResponse;

export interface AskQuestionRequest {
  content: string;
}

export interface BoundingBoxResponse {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface CitationLocationResponse {
  page: number;
  bounding_boxes: BoundingBoxResponse[];
}

export interface CitationResponse {
  id: string;
  book_id: string;
  book_title: string;
  book_author: string;
  quote: string;
  page_start: number;
  page_end: number;
  order: number;
  storage_key: string | null;
  locations: CitationLocationResponse[];
}

export interface AnswerSegmentResponse {
  text: string;
  citation_ids: string[];
}

export interface AskQuestionResponse {
  message_id: string;
  assistant_message_id: string;
  segments: AnswerSegmentResponse[];
  citations: CitationResponse[];
}

export interface PresignedUrlResponse {
  url: string;
}