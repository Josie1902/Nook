"use client";

import { BookSearchResult } from "@/types/ask-nook";
import { useState } from "react";

interface BookSearchProps {
  onAdd: (result: BookSearchResult) => void;
  onSearch?: (query: string) => Promise<BookSearchResult[]>;
}

export function BookSearch({ onAdd, onSearch }: BookSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookSearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  async function handleSearch(event: React.FormEvent) {
    event.preventDefault();

    if (!query.trim()) return;

    if (!onSearch) {
      setResults([]);
      return;
    }

    setSearching(true);

    try {
      const found = await onSearch(query.trim());
      setResults(found);
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a book to add"
          className="
            min-w-0 flex-1
            rounded-[var(--radius-sm)]
            border border-[var(--line)]
            bg-[var(--surface-1)]
            px-3 py-2
            text-sm text-[var(--ink)]
            placeholder:text-[var(--subtle)]
            transition-colors
            focus:border-[var(--sage)]
            focus:outline-none
            focus:ring-2
            focus:ring-[var(--sage-light)]
          "
        />

        <button
          type="submit"
          disabled={searching || !query.trim()}
          className="
            shrink-0
            rounded-[var(--radius-sm)]
            border border-[var(--sage)]
            bg-[var(--sage)]
            px-4 py-2
            text-sm font-medium
            text-white
            transition-all
            hover:bg-[var(--sage-dark)]
            hover:border-[var(--sage-dark)]
            active:scale-[0.98]
            disabled:cursor-not-allowed
            disabled:border-[var(--line)]
            disabled:bg-[var(--surface-3)]
            disabled:text-[var(--subtle)]
          "
        >
          {searching ? "Searching..." : "Search"}
        </button>
      </form>

      {/* Results */}
      {onSearch && results.length > 0 && (
        <ul
          className="
            flex flex-col gap-1
            rounded-[var(--radius-md)]
            border border-[var(--line)]
            bg-[var(--surface-1)]
            p-1
          "
        >
          {results.map((result) => (
            <li key={result.bookId}>
              <button
                type="button"
                onClick={() => onAdd(result)}
                className="
                  flex w-full items-center justify-between
                  gap-3
                  rounded-[var(--radius-sm)]
                  px-3 py-2.5
                  text-left
                  transition-colors
                  hover:bg-[var(--surface-2)]
                  focus:bg-[var(--surface-2)]
                  focus:outline-none
                "
              >
                <span className="min-w-0 truncate text-sm text-[var(--ink)]">
                  {result.title}
                  {result.author && (
                    <span className="text-[var(--muted)]">
                      {" "}
                      — {result.author}
                    </span>
                  )}
                </span>

                <span
                  className="
                    shrink-0
                    rounded-full
                    bg-[var(--sage-light)]
                    px-2.5 py-1
                    text-xs font-medium
                    text-[var(--sage-dark)]
                    transition-colors
                    group-hover:bg-[var(--sage)]
                  "
                >
                  Add
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Empty search result */}
      {onSearch && !searching && query.trim() && results.length === 0 && (
        <p className="px-1 text-xs text-[var(--subtle)]">
          No books found.
        </p>
      )}
    </div>
  );
}
