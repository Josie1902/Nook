"use client";

import { useEffect, useState } from "react";
import { getSessionBooks } from "@/lib/api/session";
import { SessionBook } from "@/lib/api/types";

interface RightBookPaneProps {
  isOpen: boolean;
  onToggle: () => void;
  activeSessionId: string | null;
  sessionRefreshKey: number;
}

export function RightBookPane({
  isOpen,
  onToggle,
  activeSessionId,
  sessionRefreshKey
}: RightBookPaneProps) {
  const [books, setBooks] = useState<SessionBook[]>([]);

  useEffect(() => {
    if (!activeSessionId) {
      setBooks([]);
      return;
    }

    getSessionBooks(activeSessionId).then(setBooks);
  }, [activeSessionId, sessionRefreshKey]);

  if (!isOpen) {
    return (
      <aside className="flex w-12 shrink-0 items-start justify-center border-l">
        <button
          type="button"
          onClick={onToggle}
          className="mt-4 flex h-8 w-8 items-center justify-center"
          aria-label="Open books"
        >
          ←
        </button>
      </aside>
    );
  }

  return (
    <aside className="flex w-80 shrink-0 flex-col border-l">
      <div className="flex items-center justify-between p-4">
        <span className="font-medium">
          Books
        </span>

        <button
          type="button"
          onClick={onToggle}
          className="flex h-8 w-8 items-center justify-center"
          aria-label="Collapse books"
        >
          →
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {!activeSessionId ? (
          <p className="p-4 text-sm text-neutral-500">
            Select a session.
          </p>
        ) : (
          <BookList
            books={books}
          />
        )}
      </div>
    </aside>
  );
}

function BookList({
  books,
}: {
  books: SessionBook[];
}) {
  return (
    <div className="p-4">
      {books.length === 0 ? (
        <p className="text-sm text-neutral-500">
          No books in this session.
        </p>
      ) : (
        <div className="space-y-2">
          {books.map((book) => (
            <button
              key={book.book_id}
              type="button"
              className="flex w-full gap-3 p-2 text-left hover:bg-neutral-50"
            >
              {book.cover_url ? (
                <img
                  src={book.cover_url}
                  alt=""
                  className="h-16 w-11 shrink-0 object-cover"
                />
              ) : (
                <div className="h-16 w-11 shrink-0 bg-neutral-100" />
              )}

              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {book.title || "Untitled"}
                </p>

                <p className="truncate text-xs text-neutral-500">
                  {book.author || "Unknown author"}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

