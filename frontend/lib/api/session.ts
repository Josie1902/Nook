import { api } from "./client";
import type {
  AddBookRequest,
  AskQuestionRequest,
  AskQuestionResponse,
  MessageResponse,
  ResearchConfirmRequest,
  ResearchRefineRequest,
  ResearchRequest,
  ResearchSelectionResponse,
  Session,
  SessionBook,
  SessionDetail,
  UpdateSessionRequest,
} from "./types";

export function createSession(): Promise<Session> {
  return api.post<Session>("/sessions", {});
}

export function updateSession(
  data: UpdateSessionRequest,
): Promise<Session> {
  return api.patch<Session>("/sessions", data);
}

export function getSessions(): Promise<Session[]> {
  return api.get<Session[]>("/sessions");
}

export function getSession(sessionId: string): Promise<SessionDetail> {
  return api.get<SessionDetail>(
    `/sessions/${encodeURIComponent(sessionId)}`,
  );
}

export function deleteSession(sessionId: string): Promise<void> {
  return api.delete(
    `/sessions/${encodeURIComponent(sessionId)}`,
  );
}

export function addBookToSession(
  sessionId: string,
  data: AddBookRequest,
): Promise<SessionBook> {
  return api.post<SessionBook>(
    `/sessions/${encodeURIComponent(sessionId)}/books`,
    data,
  );
}

export function removeBookFromSession(
  sessionId: string,
  bookId: string,
): Promise<void> {
  return api.delete<void>(
    `/sessions/${encodeURIComponent(sessionId)}/books/${encodeURIComponent(bookId)}`,
  );
}

export function getSessionBooks(
  sessionId: string,
): Promise<SessionBook[]> {
  return api.get<SessionBook[]>(
    `/sessions/${encodeURIComponent(sessionId)}/books`,
  );
}

export function startResearch(
  sessionId: string,
  data: ResearchRequest,
): Promise<ResearchSelectionResponse> {
  return api.post<ResearchSelectionResponse>(
    `/sessions/${encodeURIComponent(sessionId)}/research`,
    data,
  );
}

export function refineResearch(
  sessionId: string,
  data: ResearchRefineRequest,
): Promise<ResearchSelectionResponse> {
  return api.post<ResearchSelectionResponse>(
    `/sessions/${encodeURIComponent(sessionId)}/research/refine`,
    data,
  );
}

export function confirmResearchSelection(
  sessionId: string,
  data: ResearchConfirmRequest,
): Promise<ResearchSelectionResponse> {
  return api.post<ResearchSelectionResponse>(
    `/sessions/${encodeURIComponent(sessionId)}/research/confirm`,
    data,
  );
}

export function listMessages(
  sessionId: string,
): Promise<MessageResponse[]> {
  return api.get<MessageResponse[]>(
    `/sessions/${encodeURIComponent(sessionId)}/messages`,
  );
}

export function askQuestion(
  sessionId: string,
  data: AskQuestionRequest,
): Promise<AskQuestionResponse> {
  return api.post<AskQuestionResponse>(
    `/sessions/${encodeURIComponent(sessionId)}/messages`,
    data,
  );
}
