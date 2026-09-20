"use client";

import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useState } from "react";

import { deleteBook } from "@/lib/api/books";
import { Book } from "@/types/book";
import type { ReadingSession } from "@/types/ask-nook";

import { useBookStore } from "@/stores/book-store";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils/helper";

interface OpenBookProps {
  book: Book | null;
  onClose: () => void;
  readingSessions?: ReadingSession[];
  onOpenReadingSession?: (sessionId: string) => void;
}

export function OpenBook({
  book,
  onClose,
  readingSessions = [],
  onOpenReadingSession,
}: OpenBookProps) {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const removeBook = useBookStore((state) => state.removeBook);

  const attachedSessions = book
    ? readingSessions.filter((session) =>
        (book.readingSessionIds ?? []).includes(session.id),
      )
    : [];

  const handleRemoveBook = async () => {
    if (!book) return;

    setDeleteError(null);
    setIsDeleting(true);

    try {
      await deleteBook(book.id);
      removeBook(book.id);
      setShowDeleteConfirmation(false);
      onClose();
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : "Unable to remove this book.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBackdropMouseDown = (
    event: React.MouseEvent<HTMLDivElement>,
  ) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {book && (
        <>
          {/* Catalogue modal */}
          <motion.div
            key={`${book.id}-dialog`}
            className="
              fixed
              inset-0
              z-50
              flex
              items-center
              justify-center
              bg-[color-mix(in_srgb,var(--ink)_50%,transparent)]
              p-3
              sm:p-6
            "
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={handleBackdropMouseDown}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={`${book.title ?? "Untitled book"} library catalogue record`}
              className="
                relative
                flex
                w-full
                max-w-4xl
                max-h-[min(90vh,720px)]
                flex-col
                overflow-hidden
                rounded-sm
                border
                border-(--line)
                bg-(--surface-1)
                text-(--ink)
                shadow-[0_24px_80px_rgba(30,30,30,0.16)]
                md:flex-row
              "
              initial={{
                opacity: 0,
                scale: 0.98,
                y: 10,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.985,
                y: 6,
              }}
              transition={{
                duration: 0.25,
              }}
              onMouseDown={(event) => event.stopPropagation()}
            >
              {/* Close */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close catalogue record"
                className="
                  absolute
                  right-3
                  top-3
                  z-20
                  flex
                  size-8
                  items-center
                  justify-center
                  rounded-full
                  text-(--subtle)
                  transition-colors
                  hover:bg-(--surface-2)
                  hover:text-(--ink)
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-(--sage)
                "
              >
                <X className="size-4" />
              </button>

              {/* ─────────────────────────────────────
                  LEFT / CATALOGUE INFORMATION
              ───────────────────────────────────── */}
              <section
                className="
                  min-w-0
                  flex-1
                  overflow-y-auto
                  px-6
                  py-7
                  sm:px-8
                  md:px-9
                "
              >
                <header>
                  <p
                    className="
                      text-[9px]
                      font-semibold
                      uppercase
                      tracking-[0.16em]
                      text-(--subtle)
                    "
                  >
                    Library Catalogue
                  </p>

                  <div className="mt-4 border-b border-(--line) pb-6">
                    <h1
                      className="
                        max-w-md
                        pr-8
                        font-serif
                        text-2xl
                        font-normal
                        leading-tight
                        text-(--ink)
                      "
                    >
                      {book.title ?? "Untitled"}
                    </h1>

                    {book.author && (
                      <p className="mt-2 text-sm text-(--muted)">
                        {book.author}
                      </p>
                    )}
                  </div>
                </header>

                {/* Library information */}
                <section className="mt-7">
                  <p
                    className="
                      mb-3
                      text-[9px]
                      font-semibold
                      uppercase
                      tracking-[0.15em]
                      text-(--subtle)
                    "
                  >
                    Library Information
                  </p>

                  <dl className="divide-y divide-(--line)">
                    <CatalogueRow
                      label="Added to shelf"
                      value={formatDate(book.created_at)}
                    />

                    <CatalogueRow
                      label="Mentioned in chats"
                      value="0 times"
                      emphasized
                    />
                  </dl>
                </section>

                {/* Reading sessions */}
                <section className="mt-8">
                  <div className="mb-3 flex items-baseline justify-between">
                    <p
                      className="
                        text-[9px]
                        font-semibold
                        uppercase
                        tracking-[0.15em]
                        text-(--subtle)
                      "
                    >
                      Attached Reading Sessions
                    </p>

                    {attachedSessions.length > 0 && (
                      <span className="text-[9px] text-(--subtle)">
                        {attachedSessions.length}
                      </span>
                    )}
                  </div>

                  {attachedSessions.length > 0 ? (
                    <div className="divide-y divide-(--line) border-y border-(--line)">
                      {attachedSessions.map((session) => (
                        <button
                          key={session.id}
                          type="button"
                          onClick={() =>
                            onOpenReadingSession?.(session.id)
                          }
                          className="
                            group
                            flex
                            w-full
                            items-center
                            justify-between
                            gap-4
                            py-3
                            text-left
                            transition-colors
                            hover:bg-(--surface-2)
                            focus-visible:outline-none
                            focus-visible:ring-1
                            focus-visible:ring-inset
                            focus-visible:ring-(--sage)
                          "
                        >
                          <div className="min-w-0">
                            <p className="truncate text-xs text-(--ink)">
                              {session.title}
                            </p>

                            <p className="mt-1 text-[9px] text-(--subtle)">
                              {session.started_at}
                            </p>
                          </div>

                          <span
                            aria-hidden="true"
                            className="
                              shrink-0
                              text-xs
                              text-(--subtle)
                              transition-transform
                              group-hover:translate-x-0.5
                            "
                          >
                            →
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p
                      className="
                        border
                        border-dashed
                        border-(--line)
                        px-3
                        py-3
                        text-[10px]
                        text-(--subtle)
                      "
                    >
                      No reading sessions attached.
                    </p>
                  )}
                </section>

                {/* Remove */}
                <div className="mt-8 border-t border-(--line) pt-5">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setDeleteError(null);
                      setShowDeleteConfirmation(true);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </section>

              {/* ─────────────────────────────────────
                  RIGHT / BIBLIOGRAPHIC RECORD
              ───────────────────────────────────── */}
              <section
                className="
                  min-w-0
                  flex-1
                  overflow-y-auto
                  border-t
                  border-(--line)
                  bg-(--surface-2)
                  px-6
                  py-7
                  sm:px-8
                  md:border-l
                  md:border-t-0
                  md:px-9
                "
              >
                <p
                  className="
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.16em]
                    text-(--subtle)
                  "
                >
                  Bibliographic Record
                </p>

                {/* Cover + metadata */}
                <div
                  className="
                    mt-5
                    flex
                    gap-5
                    border-y
                    border-(--line)
                    py-5
                    sm:gap-6
                  "
                >
                  {book.cover_url && (
                    <div className="shrink-0">
                      <img
                        src={book.cover_url}
                        alt={`Cover of ${book.title ?? "Untitled book"}`}
                        className="
                          h-32
                          w-21
                          rounded-[3px]
                          object-cover
                          shadow-[1px_3px_6px_rgba(30,30,30,0.10)]
                        "
                      />
                    </div>
                  )}

                  <dl className="min-w-0 flex-1">
                    <BookDetail
                      label="Title"
                      value={book.title}
                    />

                    <BookDetail
                      label="Author"
                      value={book.author}
                    />

                    <BookDetail
                      label="Year"
                      value={book.publication_year?.toString()}
                    />

                    <BookDetail
                      label="ISBN"
                      value={book.isbn}
                    />
                  </dl>
                </div>

                {/* Description */}
                {book.description && (
                  <section className="mt-7">
                    <p
                      className="
                        mb-2
                        text-[9px]
                        font-semibold
                        uppercase
                        tracking-[0.15em]
                        text-(--subtle)
                      "
                    >
                      Description
                    </p>

                    <p
                      className="
                        max-w-lg
                        text-xs
                        leading-5
                        text-(--muted)
                      "
                    >
                      {book.description}
                    </p>
                  </section>
                )}

                {/* Subjects */}
                {book.tags?.length > 0 && (
                  <section className="mt-7">
                    <p
                      className="
                        mb-2.5
                        text-[9px]
                        font-semibold
                        uppercase
                        tracking-[0.15em]
                        text-(--subtle)
                      "
                    >
                      Subjects
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      {book.tags
                        .filter((tag) => tag.trim().length > 0)
                        .map((tag) => (
                          <span
                            key={tag}
                            className="
                              border
                              border-(--line)
                              bg-(--surface-1)
                              px-2
                              py-1
                              text-[9px]
                              text-(--muted)
                            "
                          >
                            {tag}
                          </span>
                        ))}
                    </div>
                  </section>
                )}
              </section>
            </motion.div>
          </motion.div>

          {/* Delete confirmation */}
          <AnimatePresence>
            {showDeleteConfirmation && (
              <motion.div
                key={`${book.id}-delete-confirmation`}
                className="
                  fixed
                  inset-0
                  z-60
                  flex
                  items-center
                  justify-center
                  bg-[color-mix(in_srgb,var(--ink)_28%,transparent)]
                  p-4
                "
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onMouseDown={(event) => {
                  if (
                    event.target === event.currentTarget &&
                    !isDeleting
                  ) {
                    setShowDeleteConfirmation(false);
                  }
                }}
              >
                <motion.div
                  role="alertdialog"
                  aria-modal="true"
                  aria-labelledby="remove-book-title"
                  aria-describedby="remove-book-description"
                  className="
                    w-full
                    max-w-sm
                    rounded-sm
                    border
                    border-(--line)
                    bg-(--surface-1)
                    p-6
                    text-(--ink)
                    shadow-[0_20px_60px_rgba(30,30,30,0.18)]
                  "
                  initial={{
                    opacity: 0,
                    scale: 0.98,
                    y: 8,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.98,
                    y: 6,
                  }}
                  transition={{
                    duration: 0.2,
                  }}
                  onMouseDown={(event) => event.stopPropagation()}
                >
                  <p
                    className="
                      text-[9px]
                      font-semibold
                      uppercase
                      tracking-[0.16em]
                      text-(--subtle)
                    "
                  >
                    Remove from Library
                  </p>

                  <h2
                    id="remove-book-title"
                    className="
                      mt-3
                      font-serif
                      text-xl
                      font-normal
                      leading-tight
                    "
                  >
                    Remove this book?
                  </h2>

                  <p
                    id="remove-book-description"
                    className="
                      mt-3
                      text-xs
                      leading-5
                      text-(--muted)
                    "
                  >
                    <span className="font-medium text-(--ink)">
                      {book.title ?? "Untitled"}
                    </span>{" "}
                    will be removed from your library.
                  </p>

                  {deleteError && (
                    <p className="mt-3 text-[11px] text-red-700">
                      {deleteError}
                    </p>
                  )}

                  <div className="mt-6 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirmation(false)}
                      disabled={isDeleting}
                      className="
                        border
                        border-(--line)
                        bg-(--surface-1)
                        px-4
                        py-2
                        text-[9px]
                        font-semibold
                        uppercase
                        tracking-[0.12em]
                        text-(--ink)
                        transition-colors
                        hover:bg-(--surface-2)
                        focus-visible:outline-none
                        focus-visible:ring-1
                        focus-visible:ring-(--sage)
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleRemoveBook}
                      disabled={isDeleting}
                      className="
                        border
                        border-red-200
                        bg-red-50
                        px-4
                        py-2
                        text-[9px]
                        font-semibold
                        uppercase
                        tracking-[0.12em]
                        text-red-700
                        transition-colors
                        hover:bg-red-100
                        focus-visible:outline-none
                        focus-visible:ring-1
                        focus-visible:ring-red-500
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                    >
                      {isDeleting ? "Removing…" : "Remove book"}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}

function CatalogueRow({
  label,
  value,
  emphasized = false,
}: {
  label: string;
  value: string;
  emphasized?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-2.5">
      <dt className="text-[11px] text-(--muted)">
        {label}
      </dt>

      <dd
        className={
          emphasized
            ? "text-xs font-semibold text-(--ink)"
            : "text-xs text-(--ink)"
        }
      >
        {value}
      </dd>
    </div>
  );
}

function BookDetail({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  if (!value) return null;

  return (
    <div className="mb-3 last:mb-0">
      <dt
        className="
          text-[8px]
          font-semibold
          uppercase
          tracking-[0.13em]
          text-(--subtle)
        "
      >
        {label}
      </dt>

      <dd className="mt-1 text-xs leading-4 text-(--ink)">
        {value}
      </dd>
    </div>
  );
}

