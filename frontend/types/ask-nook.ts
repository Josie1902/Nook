export type Session = {
  id: string;
  title: string;
  startedAt: string;
  updatedAt: string;
  messageCount: number;
};


export type BookSearchResult = {
  bookId: string;
  title: string;
  author: string;
  coverUrl: string | null;
};

export type UiActivityState = "sleeping" | "awake" | "thinking";

export type ChatMessageRole = "user" | "assistant";

export interface UserMessageContent {
  text: string;
}

export interface AssistantMessageSegment {
  text: string;
  citation_ids: string[];
}

export interface AssistantMessageContent {
  segments: AssistantMessageSegment[];
  citations: Citation[];
}

export interface UserChatMessage {
  id: string;
  role: "user";
  content: UserMessageContent;
  errorMessage?: string | null;
  createdAt: string;
}

export interface AssistantChatMessage {
  id: string;
  role: "assistant";
  content: AssistantMessageContent;
  errorMessage?: string | null;
  createdAt: string;
}

export type ChatMessage = UserChatMessage | AssistantChatMessage;

export interface CitationBoundingBox {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface CitationLocation {
  page: number;
  bounding_boxes: CitationBoundingBox[];
}

export interface Citation {
  id: string;
  book_id: string;
  book_title: string;
  book_author: string;
  quote: string;
  page_start: number;
  page_end: number;
  order: number;
  storage_key: string | null;
  locations: CitationLocation[];
}

export interface AskQuestionResponse {
  message_id: string;
  assistant_message_id: string;
  segments: AssistantMessageSegment[];
  citations: Citation[];
}

export interface ReadingSession {
  id: string;
  book_id: string;
  title: string;
  started_at: string;
  updated_at: string;
  message_count: number;
}