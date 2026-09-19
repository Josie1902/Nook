import { api } from "./client";
import type { Book, BookMetadata, BookMetadataUpdate, PresignedUrlResponse, ProcessingRun } from "./types";

export function getBooks(): Promise<Book[]> {
  return api.get<Book[]>("/books");
}

export function getIncompleteProcessingBooks(): Promise<Book[]> {
  return api.get<Book[]>("/books/processing");
}

export function uploadBook(file: File): Promise<Book> {
  const formData = new FormData();
  formData.append("file", file);

  return api.postForm<Book>("/books", formData);
}

export function deleteBook(bookId: string): Promise<void> {
  return api.delete<void>(`/books/${encodeURIComponent(bookId)}`);
}

export function getBookMetadata(bookId: string): Promise<BookMetadata> {
  return api.get<BookMetadata>(`/books/${encodeURIComponent(bookId)}/metadata`);
}

export function updateBookMetadata(
  bookId: string,
  metadata: BookMetadataUpdate,
): Promise<BookMetadata> {
  return api.patch<BookMetadata>(`/books/${encodeURIComponent(bookId)}/metadata`, metadata);
}

export function getBookProcessing(bookId: string): Promise<ProcessingRun> {
  return api.get<ProcessingRun>(`/books/${encodeURIComponent(bookId)}/processing`);
}

export function retryBookProcessing(bookId: string): Promise<ProcessingRun> {
  return api.post<ProcessingRun>(`/books/${encodeURIComponent(bookId)}/retry`);
}

export function getPresignedUrl(bookId: string): Promise<PresignedUrlResponse> {
  return api.get<PresignedUrlResponse>(`/books/${encodeURIComponent(bookId)}/presigned-url`);
}