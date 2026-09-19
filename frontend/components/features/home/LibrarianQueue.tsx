"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import {
  getBookProcessing,
  getIncompleteProcessingBooks,
} from "@/lib/api/books";
import { Book } from "@/lib/api/types";
import { useBookStore } from "@/stores/book-store";
import { ProcessingBookCard } from "./ProcessingBookCard";

export function LibrarianQueue() {
  const [processingBooks, setProcessingBooks] = useState<Book[]>([]);
  const updateBook = useBookStore((state) => state.updateBook);

  useEffect(() => {
    let isCancelled = false;

    // The backend is the source of truth for which books are still
    // in the processing queue.
    const loadProcessingBooks = async () => {
      try {
        const books = await getIncompleteProcessingBooks();
        

        if (isCancelled) {
          return;
        }

        // Update the queue first so newly-processing books are added
        // and completed/cancelled books are eventually removed.
        setProcessingBooks(books);

        // Refresh the processing run for each book so the card has
        // the latest status, stage, metrics, and error information.
        const updatedBooks = await Promise.all(
          books.map(async (book) => {
            try {
              const processing = await getBookProcessing(book.id);

              const updatedBook = {
                ...book,
                processing_status: processing.status,
                processing_stage: processing.stage,
                processing_metrics: processing.metrics,
                processing_error: processing.error
                  ? {
                      code: processing.error.code,
                      message: processing.error.message,
                      details: processing.error.details,
                    }
                  : null,
              };
              if (!isCancelled) {
                updateBook(updatedBook);
              }
            
              return updatedBook;
            } catch {
              // Keep the book data from the queue endpoint if the
              // individual processing request fails.
              return book;
            }
          }),
        );

        if (!isCancelled) {
          setProcessingBooks(updatedBooks);
        }
      } catch {
        // Keep the current queue if polling fails.
        // The next polling cycle will try again.
      }
    };

    // Load immediately when the component mounts.
    void loadProcessingBooks();

    // Refresh periodically so both the queue and individual processing
    // run state stay up to date.
    const intervalId = window.setInterval(() => {
      void loadProcessingBooks();
    }, 5000);

    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  const totalCount = processingBooks.length;

  if (totalCount === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="librarian-heading"
      className="mt-16"
    >
      <div className="mb-6">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-(--sage-dark)">
              Your librarian is at work
            </p>

            <h2
              id="librarian-heading"
              className="
                mt-1
                text-2xl
                font-medium
                tracking-tight
                text-(--ink)
              "
            >
              Organising your library
            </h2>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-2xl font-medium text-(--ink)">
              {totalCount}
            </p>

            <p className="mt-1 text-xs text-(--subtle)">
              in progress
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence
          initial={false}
          mode="popLayout"
        >
          {processingBooks.map((book) => (
            <motion.div
              key={book.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{
                opacity: 0,
                y: -8,
                transition: { duration: 0.2 },
              }}
              transition={{
                layout: {
                  duration: 0.25,
                  ease: [0.2, 0.8, 0.2, 1],
                },
              }}
            >
              <ProcessingBookCard book={book} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
