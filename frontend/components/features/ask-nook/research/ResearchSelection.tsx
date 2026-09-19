"use client";

import { useState } from "react";
import type { ResearchSelectionBook, ResearchSelectionResponse } from "@/lib/api/types";
import { BookSearch } from "./BookSearch";
import { BookSearchResult } from "@/types/ask-nook";

interface ResearchSelectionProps {
  selection: ResearchSelectionResponse;
  onRefine: (args: {
    topic: string;
    description: string;
    bookIds: string[];
    comments?: string;
  }) => Promise<void>;
  onConfirm: (args: { topic: string; description: string; bookIds: string[] }) => Promise<void>;
  onSearchBooks?: (query: string) => Promise<BookSearchResult[]>;
}

export function ResearchSelection({
  selection,
  onRefine,
  onConfirm,
  onSearchBooks,
}: ResearchSelectionProps) {
  const [topic, setTopic] = useState(selection.topic);
  const [description, setDescription] = useState(selection.description);
  const [books, setBooks] = useState<ResearchSelectionBook[]>(selection.books);
  const [comments, setComments] = useState("");
  const [pending, setPending] = useState<"refine" | "confirm" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedBookIds = books.filter((b) => b.selected).map((b) => b.book_id);

  function toggleSelected(bookId: string) {
    setBooks((prev) =>
      prev.map((b) => (b.book_id === bookId ? { ...b, selected: !b.selected } : b)),
    );
  }

  function removeBook(bookId: string) {
    setBooks((prev) => prev.filter((b) => b.book_id !== bookId));
  }

  function addBook(result: BookSearchResult) {
    if (books.some((b) => b.book_id === result.bookId)) return;
    setBooks((prev) => [
      ...prev,
      {
        book_id: result.bookId,
        title: result.title,
        author: result.author,
        reason: "Added manually",
        selected: true,
      },
    ]);
  }

  async function handleRefine() {
    setPending("refine");
    setError(null);
    try {
      await onRefine({
        topic,
        description,
        bookIds: selectedBookIds,
        comments: comments.trim() || undefined,
      });
      setComments("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't refine research. Try again.");
    } finally {
      setPending(null);
    }
  }

  async function handleConfirm() {
    setPending("confirm");
    setError(null);
    try {
      await onConfirm({ topic, description, bookIds: selectedBookIds });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't confirm research. Try again.");
    } finally {
      setPending(null);
    }
  }

  const busy = pending !== null;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs font-medium tracking-tight text-(--sage-dark)">
        Research selection
      </p>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-(--subtle)">Topic</span>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          disabled={busy}
          className="rounded-sm border border-(--line) bg-(--surface-1) px-3 py-1.5 text-sm text-(--ink) focus:border-[var(--sage)] focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-(--subtle)">Description</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={busy}
          rows={3}
          className="resize-none rounded-sm border border-(--line) bg-(--surface-1) px-3 py-1.5 text-sm text-(--ink) focus:border-[var(--sage)] focus:outline-none"
        />
      </label>

      <div className="flex flex-col gap-2">
        <span className="text-xs text-[var(--subtle)]">Books</span>
        <BookSearch onAdd={addBook} onSearch={onSearchBooks} />
      </div>

      <ul className="flex flex-col gap-2">
        {books.map((book) => (
          <li
            key={book.book_id}
            className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-1)] px-3 py-2"
          >
            <div className="flex items-start justify-between gap-2">
              <label className="flex flex-1 items-start gap-2">
                <input
                  type="checkbox"
                  checked={book.selected}
                  onChange={() => toggleSelected(book.book_id)}
                  disabled={busy}
                  className="mt-1"
                />
                <span className="min-w-0">
                  <span className="block text-sm text-[var(--ink)]">{book.title}</span>
                  {book.author && (
                    <span className="block text-xs text-[var(--subtle)]">{book.author}</span>
                  )}
                  {book.reason && (
                    <span className="mt-1 block text-xs italic text-[var(--muted)]">
                      {book.reason}
                    </span>
                  )}
                </span>
              </label>
              <button
                type="button"
                onClick={() => removeBook(book.book_id)}
                disabled={busy}
                aria-label={`Remove ${book.title}`}
                className="flex-shrink-0 rounded-[var(--radius-sm)] px-2 py-1 text-xs text-[var(--subtle)] transition-colors hover:bg-[var(--surface-3)] hover:text-[var(--red)]"
              >
                ✕
              </button>
            </div>
          </li>
        ))}

        {books.length === 0 && (
          <li className="text-sm text-[var(--subtle)]">No books selected yet.</li>
        )}
      </ul>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-[var(--subtle)]">Notes for refinement (optional)</span>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          disabled={busy}
          rows={2}
          placeholder="Tell Nook what to adjust before you refine"
          className="resize-none rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface-1)] px-3 py-1.5 text-sm text-[var(--ink)] placeholder:text-[var(--subtle)] focus:border-[var(--sage)] focus:outline-none"
        />
      </label>

      {error && <p className="text-xs text-[var(--red)]">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleRefine}
          disabled={busy}
          className="rounded-[var(--radius-sm)] border border-[var(--line)] px-4 py-2 text-sm text-[var(--ink)] transition-colors hover:bg-[var(--surface-3)] disabled:cursor-not-allowed disabled:text-[var(--subtle)]"
        >
          {pending === "refine" ? "Refining…" : "Continue refinement"}
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={busy || selectedBookIds.length === 0}
          className="rounded-[var(--radius-sm)] bg-[var(--sage)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--sage-dark)] disabled:cursor-not-allowed disabled:bg-[var(--surface-3)] disabled:text-[var(--subtle)]"
        >
          {pending === "confirm" ? "Confirming…" : "Confirm"}
        </button>
      </div>
    </div>
  );
}
