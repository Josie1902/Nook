"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Upload } from "lucide-react";
import { useDropzone } from "react-dropzone";

import { BookDropState } from "@/types/book-drop-state";
import { useBookStore } from "@/stores/book-store";
import { MAX_BOOKS } from "@/lib/books";

interface BookDropProps {
  state: BookDropState;
  onStateChange: (state: BookDropState) => void;
}

const DROP_ANIMATION_MS = 1000;
const COMPLETE_DISPLAY_MS = 4000;

export function BookDrop({
  state,
  onStateChange,
}: BookDropProps) {
  const uploadBook = useBookStore((state) => state.uploadBook);
  const bookCount = useBookStore((state) => state.books.length);

  const remainingSlots = Math.max(0, MAX_BOOKS - bookCount);
  const isFull = remainingSlots === 0;

  const resetTimerRef = useRef<number | null>(null);

  const isReady = state === "ready";
  const isDropping = state === "dropping";
  const isProcessing = state === "processing";
  const isComplete = state === "complete";

  async function handleFiles(files: File[]) {
    if (isFull) {
      return;
    }

    const filesToAdd = files.slice(0, remainingSlots);

    if (filesToAdd.length === 0) {
      return;
    }

    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }

    onStateChange("dropping");

    const results = await Promise.allSettled(
      filesToAdd.map((file) => uploadBook(file)),
    );

    const successfulUploads = results.some(
      (result) => result.status === "fulfilled",
    );

    // All books failed.
    if (!successfulUploads) {
      onStateChange("idle");
      return;
    }

    // At least one book was uploaded successfully.
    onStateChange("processing");

    window.setTimeout(() => {
      onStateChange("complete");

      resetTimerRef.current = window.setTimeout(() => {
        onStateChange("idle");
      }, COMPLETE_DISPLAY_MS);
    }, DROP_ANIMATION_MS);
  }

  const {
    getRootProps,
    getInputProps,
    open,
    isDragActive,
  } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: true,
    noClick: true,
    disabled:
      isFull ||
      isDropping ||
      isProcessing ||
      isComplete,

    onDrop: (acceptedFiles) => {
      handleFiles(acceptedFiles);
    },

    onDragEnter: () => {
      if (
        !isFull &&
        !isDropping &&
        !isProcessing &&
        !isComplete
      ) {
        onStateChange("ready");
      }
    },

    onDragLeave: () => {
      if (
        !isDropping &&
        !isProcessing &&
        !isComplete
      ) {
        onStateChange("idle");
      }
    },
  });

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  return (
    <div
      {...getRootProps()}
      className="relative w-56 sm:w-64"
    >
      <input {...getInputProps()} />

      <motion.div
        animate={{
          y: isReady ? -4 : 0,
        }}
        transition={{
          duration: 0.3,
          ease: [0.2, 0.8, 0.2, 1],
        }}
      >
        {/* Drop box */}
        <div
          className={`
            relative
            overflow-hidden
            rounded-t-md
            border
            border-(--sage-dark)
            bg-(--sage)
            px-5
            pb-6
            pt-6
            shadow-[0_12px_28px_rgba(72,96,71,0.14)]
            transition-shadow
            ${isDragActive
              ? "shadow-[0_0_0_3px_rgba(255,255,255,0.14)]"
              : ""}
          `}
        >
          {/* Label */}
          <div className="text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
            Book Drop
          </div>

          {/* Return slot */}
          <div className="relative mt-4 rounded-sm border border-black/10 bg-(--sage-dark) p-2">
            <div className="h-5 rounded-full bg-black/25 shadow-inner" />

            <AnimatePresence>
              {isDropping && (
                <>
                  {[0, 1, 2].map((index) => (
                    <motion.div
                      key={index}
                      initial={{
                        opacity: 0,
                        y: -50 - index * 8,
                        rotate:
                          index % 2 === 0 ? -4 : 4,
                      }}
                      animate={{
                        opacity: 1,
                        y: 5 + index * 2,
                        rotate:
                          index % 2 === 0 ? 2 : -2,
                      }}
                      exit={{
                        opacity: 0,
                        y: 25,
                      }}
                      transition={{
                        delay: index * 0.12,
                        duration: 0.9,
                        ease: [0.2, 0.8, 0.2, 1],
                      }}
                      className="
                        absolute
                        left-1/2
                        -top-12
                        h-10
                        w-8
                        -translate-x-1/2
                        rounded-xs
                        bg-(--surface-1)
                        shadow-[2px_3px_6px_rgba(30,30,30,0.18)]
                      "
                      style={{
                        marginLeft: `${(index - 1) * 5}px`,
                      }}
                    />
                  ))}
                </>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            {isComplete ? (
              <motion.div
                key="complete"
                initial={{
                  opacity: 0,
                  y: 4,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="mt-5 text-center"
              >
                <p className="text-sm font-medium text-white">
                  Books are sent for inspection
                </p>

                <p className="mt-1 text-xs text-white/65">
                  Nook will take it from here.
                </p>
              </motion.div>
            ) : isProcessing ? (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-5 text-center"
              >
                <p className="text-sm font-medium text-white">
                  Putting them on the shelf…
                </p>

                <p className="mt-1 text-xs text-white/65">
                  Nook is cataloguing your books.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="default"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-5 text-center"
              >
                <p className="text-sm font-medium text-white">
                  {isReady
                    ? "Release your books"
                    : "Drop a book to Nook"}
                </p>

                <p className="mt-1 text-xs leading-5 text-white/65">
                  {isReady
                    ? "PDFs will be added to your library."
                    : "Drop one or more PDFs here, or choose from your computer."}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* File picker */}
          {!isReady &&
            !isDropping &&
            !isProcessing &&
            !isComplete && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  open();
                }}
                disabled={isFull}
                className="
                  mx-auto
                  mt-5
                  flex
                  items-center
                  gap-2
                  rounded-md
                  bg-white
                  px-3.5
                  py-2
                  text-xs
                  font-medium
                  text-(--sage-dark)
                  transition-transform
                  hover:scale-[1.02]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <Upload
                  size={14}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />

                {isFull
                  ? "Library is full"
                  : "Choose PDFs"}
              </button>
            )}
        </div>

        {/* Bottom lip */}
        <div
          aria-hidden="true"
          className="h-5 rounded-b-sm bg-(--sage-dark)"
        />
      </motion.div>
    </div>
  );
}