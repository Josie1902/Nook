"use client";

import { useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  BookOpen,
  CircleAlert,
  PencilLine,
  RefreshCcw,
  Sparkles,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import {
  deleteBook,
  getBookMetadata,
  retryBookProcessing,
  updateBookMetadata,
} from "@/lib/api/books";
import { useBookStore } from "@/stores/book-store";
import type { Book, BookMetadata } from "@/types/book";
import { OpenBook } from "./OpenBook";

interface ProcessingBookCardProps {
  book: Book;
}

function labelFromStatus(status: string) {
  switch (status) {
    case "pending":
      return "Queued";
    case "running":
      return "Processing";
    case "validation_required":
      return "Review";
    case "failed":
      return "Failed";
    case "cancelled":
      return "Cancelled";
    case "completed":
      return "Ready";
    default:
      return status || "Processing";
  }
}

function labelFromStage(stage: string | null | undefined): string {
  switch ((stage ?? "").toLowerCase()) {
    case "metadata":
      return "Reading metadata";
    case "chunking":
      return "Preparing content";
    case "embedding":
      return "Building search index";
    default:
      return stage || "Processing";
  }
}

export function ProcessingBookCard({
  book,
}: ProcessingBookCardProps) {
  const updateBook = useBookStore((state) => state.updateBook);
  const removeBook = useBookStore((state) => state.removeBook);

  const [isRetrying, setIsRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);

  const [metadataReview, setMetadataReview] =
    useState<BookMetadata | null>(null);
  const [metadataLoading, setMetadataLoading] = useState(false);
  const [metadataError, setMetadataError] = useState<string | null>(null);
  const [isSubmittingMetadata, setIsSubmittingMetadata] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [openBook, setOpenBook] = useState<Book | null>(null);

  const statusLabel = labelFromStatus(book.processing_status);
  const stageLabel = labelFromStage(book.processing_stage);
  const isReady = book.processing_status === "completed";
  const isFailed = book.processing_status === "failed";

  const errorMessage =
    book.processing_error?.message?.trim() ||
    (isFailed ? "Something went wrong." : "");

  const progressValue = (() => {
    switch ((book.processing_stage ?? "").toLowerCase()) {
      case "metadata":
        return 24;
      case "chunking":
        return 72;
      case "embedding":
        return 92;
      default:
        break;
    }

    if (book.processing_status === "completed") return 100;
    if (book.processing_status === "failed") return 100;
    if (book.processing_status === "validation_required") return 80;
    if (book.processing_status === "running") return 45;
    if (book.processing_status === "pending") return 12;

    return 20;
  })();

  const requiredFieldsValid =
    Boolean(metadataReview?.title?.trim()) &&
    Boolean(metadataReview?.author?.trim()) &&
    Boolean(metadataReview?.description?.trim()) &&
    Boolean(metadataReview?.isbn?.trim());

  const handleOpenMetadataReview = async () => {
    setMetadataError(null);
    setMetadataLoading(true);

    try {
      const response = await getBookMetadata(book.id);

      setMetadataReview(response);
      setTagInput("");
    } catch (error) {
      setMetadataError(
        error instanceof Error
          ? error.message
          : "Unable to load metadata review.",
      );
    } finally {
      setMetadataLoading(false);
    }
  };

  const handleMetadataFieldChange = <K extends keyof BookMetadata>(
    field: K,
    value: BookMetadata[K],
  ) => {
    if (!metadataReview) return;

    setMetadataReview({
      ...metadataReview,
      [field]: value,
    });
  };

  const addTag = (value: string) => {
    if (!metadataReview) return;

    const tag = value.trim();

    if (!tag) return;

    const exists = (metadataReview.tags ?? []).some(
      (existingTag) =>
        existingTag.toLowerCase() === tag.toLowerCase(),
    );

    if (exists) {
      setTagInput("");
      return;
    }

    handleMetadataFieldChange("tags", [
      ...(metadataReview.tags ?? []),
      tag,
    ]);

    setTagInput("");
  };

  const removeTag = (tagToRemove: string) => {
    if (!metadataReview) return;

    handleMetadataFieldChange(
      "tags",
      (metadataReview.tags ?? []).filter(
        (tag) => tag !== tagToRemove,
      ),
    );
  };

  const handleTagKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag(tagInput);
      return;
    }

    if (
      event.key === "Backspace" &&
      !tagInput &&
      metadataReview?.tags?.length
    ) {
      removeTag(
        metadataReview.tags[metadataReview.tags.length - 1],
      );
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryError(null);

    try {
      const run = await retryBookProcessing(book.id);

      updateBook({
        ...book,
        processing_status: run.status,
        processing_stage: run.stage,
        processing_metrics: run.metrics,
        processing_error: run.error
          ? {
              code: run.error.code,
              message: run.error.message,
              details: run.error.details,
            }
          : null,
      });
    } catch (error) {
      setRetryError(
        error instanceof Error
          ? error.message
          : "Unable to retry this book.",
      );
    } finally {
      setIsRetrying(false);
    }
  };

  const handleSubmitMetadata = async () => {
    if (!metadataReview || !requiredFieldsValid) {
      return;
    }

    const payload: BookMetadata = {
      title: metadataReview.title?.trim() ?? "",
      author: metadataReview.author?.trim() ?? "",
      description: metadataReview.description?.trim() ?? "",
      isbn: metadataReview.isbn?.trim() ?? "",
      publication_year: metadataReview.publication_year,
      cover_url: metadataReview.cover_url?.trim() || null,
      tags: metadataReview.tags ?? [],
    };

    setIsSubmittingMetadata(true);
    setMetadataError(null);

    try {
      const response = await updateBookMetadata(
        book.id,
        payload,
      );

      updateBook({
        ...book,
        title: response.title,
        author: response.author,
        description: response.description,
        isbn: response.isbn,
        publication_year: response.publication_year,
        cover_url: response.cover_url,
        tags: response.tags,
        processing_status: response.processing_status,
      });

      setMetadataReview(null);
      setTagInput("");
    } catch (error) {
      setMetadataError(
        error instanceof Error
          ? error.message
          : "Unable to confirm metadata.",
      );
    } finally {
      setIsSubmittingMetadata(false);
    }
  };

  const handleCancelReview = async () => {
    setDeleteError(null);
    setIsDeleting(true);

    try {
      await deleteBook(book.id);

      removeBook(book.id);
      setMetadataReview(null);
      setTagInput("");
      setShowCancelConfirm(false);
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : "Unable to cancel the current process.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const closeMetadataReview = () => {
    setMetadataReview(null);
    setTagInput("");
    setMetadataError(null);
    setShowCancelConfirm(false);
  };

  const previewCoverUrl =
    metadataReview?.cover_url ?? book.cover_url;

  return (
    <>
      <motion.article
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{
          duration: 0.35,
          ease: [0.2, 0.8, 0.2, 1],
        }}
        className="rounded-lg border border-(--line) bg-(--surface-1) p-3"
      >
        <div className="flex items-center gap-3">
          <div
            className="relative h-20 w-14 shrink-0 overflow-hidden rounded-[3px] shadow-[2px_4px_8px_rgba(30,30,30,0.10)]"
            style={{
              backgroundColor:
                book.color ?? "var(--sage)",
            }}
          >
            {previewCoverUrl && (
              <img
                src={previewCoverUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            )}

            <div
              aria-hidden="true"
              className="absolute inset-y-0 left-1 w-px bg-white/20"
            />

            <span className="absolute inset-y-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-[7px] font-medium text-white/80 [writing-mode:vertical-rl]">
              {book.title ?? "Untitled"}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-medium text-(--ink)">
              {book.title ?? book.filename}
            </h3>

            <div className="mt-2 flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2 text-[10px] text-(--subtle)">
                <span className="inline-flex items-center gap-1 rounded-full bg-(--surface-2) px-2 py-1 font-medium text-(--ink)">
                  {book.processing_status === "running" && (
                    <Sparkles className="size-3 text-(--sage-dark)" />
                  )}

                  {isFailed && (
                    <CircleAlert className="size-3 text-red-700" />
                  )}

                  {statusLabel}
                </span>

                <span className="truncate">
                  {stageLabel}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {book.processing_status ===
                  "validation_required" && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleOpenMetadataReview}
                    disabled={metadataLoading}
                    className="h-9"
                  >
                    <PencilLine className="size-3.5" />
                    {metadataLoading
                      ? "Loading…"
                      : "Edit Metadata"}
                  </Button>
                )}

                {isReady && (
                  <button
                    type="button"
                    aria-label="Open book"
                    title="Open book"
                    onClick={() => setOpenBook(book)}
                    className="flex size-8 items-center justify-center rounded-full border border-(--line) bg-(--surface-2) text-(--ink) transition-colors hover:bg-(--surface-3) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--sage)"
                  >
                    <BookOpen className="size-4" />
                  </button>
                )}

                {isFailed && (
                  <button
                    type="button"
                    aria-label="Retry processing"
                    title="Retry processing"
                    onClick={handleRetry}
                    disabled={isRetrying}
                    className="flex size-8 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                  >
                    <RefreshCcw
                      className={`size-4 ${
                        isRetrying ? "animate-spin" : ""
                      }`}
                    />
                  </button>
                )}
              </div>
            </div>

            <div className="mt-2">
              <div className="mb-1 flex items-center justify-between text-[10px] text-(--subtle)">
                <span>
                  {isFailed
                    ? "Needs attention"
                    : "Progress"}
                </span>

                <span>
                  {Math.min(progressValue, 100)}%
                </span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-(--surface-2)">
                <motion.div
                  className={`h-full rounded-full ${
                    isFailed
                      ? "bg-red-500"
                      : "bg-(--sage)"
                  }`}
                  animate={{
                    width: `${Math.min(
                      progressValue,
                      100,
                    )}%`,
                  }}
                  transition={{
                    duration: 0.35,
                    ease: [0.2, 0.8, 0.2, 1],
                  }}
                />
              </div>
            </div>

            {errorMessage && (
              <p className="mt-2 max-w-48 truncate text-[10px] text-red-700">
                {errorMessage}
              </p>
            )}

            {retryError && (
              <p className="mt-1.5 text-[10px] text-red-700">
                {retryError}
              </p>
            )}
          </div>
        </div>
      </motion.article>

      <OpenBook
        book={openBook}
        onClose={() => setOpenBook(null)}
      />

      <AnimatePresence>
        {metadataReview && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{
                opacity: 0,
                y: 12,
                scale: 0.98,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 8,
                scale: 0.98,
              }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-4xl overflow-hidden rounded-xl border border-(--line) bg-(--surface-1) text-(--ink) shadow-[0_18px_40px_rgba(30,30,30,0.12)]"
            >
              <div className="flex items-center justify-between border-b border-(--line) px-5 py-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-(--subtle)">
                    Metadata
                  </p>

                  <h3 className="mt-1 text-lg font-medium">
                    Confirm book details
                  </h3>

                  <p className="mt-1 text-xs text-(--subtle)">
                    Review the details before adding this book.
                  </p>
                </div>

                <button
                  type="button"
                  aria-label="Close metadata review"
                  title="Close"
                  onClick={closeMetadataReview}
                  className="flex size-8 shrink-0 items-center justify-center rounded-full border border-(--line) bg-(--surface-2) text-(--subtle) transition-colors hover:bg-(--surface-3) hover:text-(--ink) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--sage)"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="grid md:grid-cols-[1.35fr_0.65fr]">
                <div className="px-5 py-5 md:border-r md:border-(--line)">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-1.5 text-xs font-medium text-(--muted)">
                      <span>
                        Title{" "}
                        <span className="text-red-600">
                          *
                        </span>
                      </span>

                      <input
                        required
                        value={metadataReview.title ?? ""}
                        onChange={(event) =>
                          handleMetadataFieldChange(
                            "title",
                            event.target.value || null,
                          )
                        }
                        placeholder="Book title"
                        className="w-full rounded-md border border-(--line) bg-(--surface-1) px-3 py-2.5 text-sm text-(--ink) outline-none transition placeholder:text-(--subtle) focus:border-(--sage) focus:ring-2 focus:ring-(--sage-light)"
                      />
                    </label>

                    <label className="space-y-1.5 text-xs font-medium text-(--muted)">
                      <span>
                        Author{" "}
                        <span className="text-red-600">
                          *
                        </span>
                      </span>

                      <input
                        required
                        value={metadataReview.author ?? ""}
                        onChange={(event) =>
                          handleMetadataFieldChange(
                            "author",
                            event.target.value || null,
                          )
                        }
                        placeholder="Author name"
                        className="w-full rounded-md border border-(--line) bg-(--surface-1) px-3 py-2.5 text-sm text-(--ink) outline-none transition placeholder:text-(--subtle) focus:border-(--sage) focus:ring-2 focus:ring-(--sage-light)"
                      />
                    </label>

                    <label className="space-y-1.5 text-xs font-medium text-(--muted) sm:col-span-2">
                      <span>
                        Description{" "}
                        <span className="text-red-600">
                          *
                        </span>
                      </span>

                      <textarea
                        required
                        value={
                          metadataReview.description ?? ""
                        }
                        onChange={(event) =>
                          handleMetadataFieldChange(
                            "description",
                            event.target.value || null,
                          )
                        }
                        placeholder="A short description of the book"
                        className="min-h-24 w-full resize-y rounded-md border border-(--line) bg-(--surface-1) px-3 py-2.5 text-sm text-(--ink) outline-none transition placeholder:text-(--subtle) focus:border-(--sage) focus:ring-2 focus:ring-(--sage-light)"
                      />
                    </label>

                    <label className="space-y-1.5 text-xs font-medium text-(--muted)">
                      <span>
                        ISBN{" "}
                        <span className="text-red-600">
                          *
                        </span>
                      </span>

                      <input
                        required
                        value={metadataReview.isbn ?? ""}
                        onChange={(event) =>
                          handleMetadataFieldChange(
                            "isbn",
                            event.target.value || null,
                          )
                        }
                        placeholder="ISBN-10 or ISBN-13"
                        className="w-full rounded-md border border-(--line) bg-(--surface-1) px-3 py-2.5 text-sm text-(--ink) outline-none transition placeholder:text-(--subtle) focus:border-(--sage) focus:ring-2 focus:ring-(--sage-light)"
                      />
                    </label>

                    <label className="space-y-1.5 text-xs font-medium text-(--muted)">
                      <span>Publication year</span>

                      <input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        value={
                          metadataReview.publication_year ?? ""
                        }
                        onChange={(event) =>
                          handleMetadataFieldChange(
                            "publication_year",
                            event.target.value === ""
                              ? null
                              : Number(event.target.value),
                          )
                        }
                        placeholder="e.g. 2024"
                        className="w-full rounded-md border border-(--line) bg-(--surface-1) px-3 py-2.5 text-sm text-(--ink) outline-none transition placeholder:text-(--subtle) focus:border-(--sage) focus:ring-2 focus:ring-(--sage-light) [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                    </label>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-medium text-(--muted)">
                        Tags
                      </label>

                      <div className="min-h-11 rounded-md border border-(--line) bg-(--surface-1) px-2.5 py-2 transition-colors focus-within:border-(--sage) focus-within:ring-2 focus-within:ring-(--sage-light)">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {(metadataReview.tags ?? []).map(
                            (tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center gap-1 rounded-full bg-(--sage-light) px-2.5 py-1 text-xs font-medium text-(--sage-dark)"
                              >
                                {tag}

                                <button
                                  type="button"
                                  aria-label={`Remove ${tag}`}
                                  onClick={() =>
                                    removeTag(tag)
                                  }
                                  className="flex h-4 w-4 items-center justify-center rounded-full text-(--sage-dark) transition-colors hover:bg-(--sage) hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-(--sage)"
                                >
                                  <X className="size-3" />
                                </button>
                              </span>
                            ),
                          )}

                          <input
                            value={tagInput}
                            onChange={(event) =>
                              setTagInput(
                                event.target.value,
                              )
                            }
                            onKeyDown={handleTagKeyDown}
                            onBlur={() => {
                              if (tagInput.trim()) {
                                addTag(tagInput);
                              }
                            }}
                            placeholder={
                              metadataReview.tags?.length
                                ? "Add tag..."
                                : "Type a tag and press Enter"
                            }
                            className="min-w-28 flex-1 border-0 bg-transparent px-1 py-1 text-sm text-(--ink) outline-none placeholder:text-(--subtle)"
                          />
                        </div>
                      </div>

                      <p className="text-[10px] text-(--subtle)">
                        Press Enter or comma to add a tag.
                      </p>
                    </div>

                    <label className="space-y-1.5 text-xs font-medium text-(--muted) sm:col-span-2">
                      <span>Cover URL</span>

                      <input
                        type="url"
                        value={
                          metadataReview.cover_url ?? ""
                        }
                        onChange={(event) =>
                          handleMetadataFieldChange(
                            "cover_url",
                            event.target.value || null,
                          )
                        }
                        placeholder="https://..."
                        className="w-full rounded-md border border-(--line) bg-(--surface-1) px-3 py-2.5 text-sm text-(--ink) outline-none transition placeholder:text-(--subtle) focus:border-(--sage) focus:ring-2 focus:ring-(--sage-light)"
                      />

                      <p className="text-[10px] font-normal text-(--subtle)">
                        Optional.
                      </p>
                    </label>
                  </div>
                </div>

                <div className="bg-(--surface-2) px-5 py-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-(--subtle)">
                    Cover
                  </p>

                  {metadataReview.cover_url ? (
                    <img
                      src={metadataReview.cover_url}
                      alt={`Cover for ${
                        metadataReview.title ?? "book"
                      }`}
                      className="mt-3 aspect-2/3 w-full rounded-md object-cover shadow-[0_6px_16px_rgba(30,30,30,0.10)]"
                      onError={(event) => {
                        event.currentTarget.style.display =
                          "none";
                      }}
                    />
                  ) : (
                    <div className="mt-3 flex aspect-2/3 items-center justify-center rounded-md border border-dashed border-(--line) bg-(--surface-1) px-4 text-center text-xs text-(--subtle)">
                      No cover image
                    </div>
                  )}
                </div>
              </div>

              {metadataError && (
                <p className="border-t border-(--line) px-5 py-3 text-xs text-red-700">
                  {metadataError}
                </p>
              )}

              {showCancelConfirm && (
                <div className="border-t border-red-100 bg-red-50 px-5 py-4">
                  <p className="text-xs font-medium text-red-900">
                    Cancel processing?
                  </p>

                  <p className="mt-1 text-xs leading-5 text-red-800">
                    This will delete the book and cannot be
                    undone.
                  </p>

                  {deleteError && (
                    <p className="mt-2 text-xs text-red-700">
                      {deleteError}
                    </p>
                  )}

                  <div className="mt-3 flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setShowCancelConfirm(false)
                      }
                    >
                      Keep editing
                    </Button>

                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleCancelReview}
                      disabled={isDeleting}
                    >
                      {isDeleting
                        ? "Cancelling…"
                        : "Cancel process"}
                    </Button>
                  </div>
                </div>
              )}

              {!showCancelConfirm && (
                <div className="flex items-center justify-between border-t border-(--line) bg-(--surface-1) px-5 py-4">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setShowCancelConfirm(true)
                    }
                  >
                    Cancel
                  </Button>

                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={handleSubmitMetadata}
                    disabled={
                      isSubmittingMetadata ||
                      metadataLoading ||
                      !requiredFieldsValid
                    }
                  >
                    {isSubmittingMetadata
                      ? "Confirming…"
                      : "Confirm metadata"}
                  </Button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
