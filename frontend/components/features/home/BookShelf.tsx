"use client";

import { motion } from "motion/react";
import { useShallow } from "zustand/shallow";

import { useBookStore } from "@/stores/book-store";
import { MAX_BOOKS } from "@/lib/books";
import { Book } from "@/types/book";

import { BookSpine } from "./BookSpine";
import { OpenBook } from "./OpenBook";
import { useState } from "react";
import { mockReadingSessions } from "@/lib/mock/mock_sessions";

export function BookShelf() {

  const books = useBookStore(
    useShallow((state) =>
      state.books
        .filter(
          (book) => book.processing_status === "completed",
        )
        .slice(0, MAX_BOOKS),
    ),
  );

  const isFull = books.length >= MAX_BOOKS;

  return (
    <section aria-labelledby="shelf-heading">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          {/* Section eyebrow */}
          <span
            className="
              text-xs
              font-semibold
              uppercase
              tracking-[0.16em]
              text-(--subtle)
            "
          >
            Your library
          </span>

          {/* Primary heading */}
          <h2
            id="shelf-heading"
            className="
              mt-1.5
              text-2xl
              font-medium
              leading-tight
              tracking-tight
              text-(--ink)
              sm:text-3xl
            "
          >
            Books on your shelf
          </h2>
        </div>

        {/* Capacity */}
        <span
          className="
            shrink-0
            pb-0.5
            text-sm
            text-(--subtle)
          "
        >
          {books.length} / {MAX_BOOKS} books
        </span>
      </div>

{/* Full library callout */}
{isFull && (
  <motion.div
    initial={{
      opacity: 0,
      y: 6,
    }}
    animate={{
      opacity: 1,
      y: 0,
    }}
    transition={{
      duration: 0.4,
      ease: [0.2, 0.8, 0.2, 1],
    }}
    className="
      mt-4
      rounded-md
      bg-(--brown)/8
      px-4
      py-3
    "
  >
    <div className="flex items-center gap-4">
      {/* Nook */}
      <div className="relative shrink-0">
        <motion.span
          initial={{ opacity: 0, y: 3, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            delay: 0.15,
            duration: 0.25,
            ease: [0.2, 0.8, 0.2, 1],
          }}
          className="
            absolute
            -top-1
            right-1
            text-sm
            font-bold
            leading-none
            text-[#dc9906]
          "
          aria-hidden="true"
        >
          !
        </motion.span>

        <img
          src="/awake_cat.png"
          alt="Nook"
          width={70}
          height={57}
          className="block"
        />
      </div>

      {/* Callout copy */}
      <div className="min-w-0">
        <p className="text-sm font-semibold text-(--ink)">
          Uh-oh, the library’s getting a little snug!
        </p>

        <p className="mt-1 text-xs leading-5 text-(--subtle)">
          Make a little room before bringing in another book.
        </p>
      </div>
    </div>
  </motion.div>
)}

      <div className="mt-16">
        {books.length === 0 ? (
          <EmptyShelf />
        ) : (
          <Shelf books={books} />
        )}
      </div>
    </section>
  );
}

function EmptyShelf() {
  return (
    <div
      className="
        relative
        rounded-md
        border
        border-dashed
        border-(--line)
        px-6
        py-14
        text-center
      "
    >
      <p
        className="
          text-sm
          font-medium
          text-(--ink)
        "
      >
        A quiet shelf awaits.
      </p>

      <p
        className="
          mt-1.5
          text-sm
          leading-6
          text-(--subtle)
        "
      >
        Add your first book to begin.
      </p>

      <div
        aria-hidden="true"
        className="
          absolute
          inset-x-8
          bottom-0
          h-3
          rounded-t-[3px]
          bg-(--brown)
          opacity-70
        "
      />
    </div>
  );
}

function Shelf({ books }: { books: Book[] }) {
  // Visual layout only.
  // The library itself can hold MAX_BOOKS.
  const BOOKS_PER_SHELF = 19;

  const shelves: Book[][] = [];

  for (
    let i = 0;
    i < books.length;
    i += BOOKS_PER_SHELF
  ) {
    shelves.push(
      books.slice(i, i + BOOKS_PER_SHELF),
    );
  }

  const [openBook, setOpenBook] = useState<Book | null>(null);

  return (
    <div>
      <OpenBook
        book={openBook}
        onClose={() => setOpenBook(null)}
        readingSessions={mockReadingSessions}
        onOpenReadingSession={() => {
          // connect this to your Ask Nook session
          console.log("Open reading sessions", openBook?.readingSessionIds);
        }}
      />

      {shelves.map((shelfBooks, shelfIndex) => (
        <div key={`shelf-${shelfIndex}`}>
          {/* Books */}
          <div
            className="
              flex
              min-h-24
              items-end
              justify-start
              gap-1
              px-8
            "
          >
            {shelfBooks.map((book, index) => (
              <motion.div
                key={`book-${book.id}`}
                initial={{
                  opacity: 0,
                  y: 12,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.04,
                  ease: [0.2, 0.8, 0.2, 1],
                }}
                className="shrink-0"
              >
                <BookSpine title={book.title ?? "Untitled"} color={book.color ?? "var(--sage)"} index={index} newlyShelved={book.newlyShelved} onOpen={() => setOpenBook(book)}/>
              </motion.div>
            ))}
          </div>


          {/* Shelf */}
          <motion.div
            initial={{
              scaleX: 0.95,
              opacity: 0,
            }}
            animate={{
              scaleX: 1,
              opacity: 1,
            }}
            transition={{
              duration: 0.45,
              ease: [0.2, 0.8, 0.2, 1],
            }}
            className="
              mx-8
              h-5
              rounded-sm
              bg-(--brown)
              shadow-[0_8px_18px_rgba(30,30,30,0.12)]
            "
          />

          <div
            aria-hidden="true"
            className="
              mx-8
              h-3
              rounded-b-sm
              bg-(--brown)
              opacity-80
            "
          />
        </div>
      ))}
    </div>
  );
}