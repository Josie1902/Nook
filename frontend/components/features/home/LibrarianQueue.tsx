"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import {
  getBookProcessing,
  getIncompleteProcessingBooks,
} from "@/lib/api/books";
import { Book } from "@/lib/api/types";
import { useBookStore } from "@/stores/book-store";
import { ProcessingBookCard } from "./ProcessingBookCard";
import { useAppErrorStore } from "@/stores/app-error-store";

export function LibrarianQueue() {
  const [processingBooks, setProcessingBooks] = useState<Book[]>([]);
  const updateBook = useBookStore((state) => state.updateBook);
  const loadBooks = useBookStore((state) => state.loadBooks);

  const processingBookIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    let isCancelled = false;
  
    const pollProcessingBooks = async () => {
      try {
        
        // 1. Discover any new books that are currently processing.
        const queueBooks = await getIncompleteProcessingBooks();
      
        if (isCancelled) {
          return;
        }
      
        // Add any new books to the processing set.
        for (const book of queueBooks) {
          processingBookIds.current.add(book.id);
        }
      
        // 2.Poll every book we're currently tracking.
        const booksToPoll = Array.from(processingBookIds.current);
      
        const updatedBooks = await Promise.all(
          booksToPoll.map(async (bookId) => {
            try {
              const processing = await getBookProcessing(bookId);
            
              return {
                bookId,
                processing,
              };
            } catch (error) {
              useAppErrorStore.getState().setError(error);
              return null;
            }
          }),
        );
      
        if (isCancelled) {
          return;
        }
      
        let hasCompletedBook = false;
      
        // 3. Update the canonical Zustand books with the latest processing information.
        for (const result of updatedBooks) {
          if (!result) {
            continue;
          }
        
          const { bookId, processing } = result;
        
          // If the book has completed processing, remove it from the set of books we're tracking.
          if (
            processing.status === "completed" ||
            processing.status === "failed" ||
            processing.status === "cancelled"
          ) {
            processingBookIds.current.delete(bookId);
          
            if (processing.status === "completed") {
              hasCompletedBook = true;
            }
          }
        
          // Update the book in Zustand with the latest processing information.
          const existingBook = useBookStore
            .getState()
            .books.find((book) => book.id === bookId);
        
          if (existingBook) {
            updateBook({
              ...existingBook,
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
            });
          }
        }
      
        // 4. Update the local state with the latest processing books.
        const currentBooks = useBookStore.getState().books;
      
        const currentProcessingBooks = currentBooks.filter((book) =>
          processingBookIds.current.has(book.id),
        );
      
        setProcessingBooks(currentProcessingBooks);
      
        // 5. If any book has completed processing, reload the canonical list of books.
        if (hasCompletedBook && !isCancelled) {
          await loadBooks();
        }

      } catch (error) {
        useAppErrorStore.getState().setError(error);
      }
    };
    
    void pollProcessingBooks();
  
    const intervalId = window.setInterval(() => {
      void pollProcessingBooks();
    }, 5000);
  
    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
    };
  }, [loadBooks, updateBook]);
  
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
