"use client";

import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import type { Citation } from "@/types/ask-nook";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

interface PdfReaderOverlayProps {
  url: string;
  citation: Citation;
  onClose: () => void;
}

export function PdfReaderOverlay({
  url,
  citation,
  onClose,
}: PdfReaderOverlayProps) {
  const citationPage =
    citation.locations[0]?.page ?? citation.page_start;

  const [pageNumber, setPageNumber] = useState(citationPage);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageSize, setPageSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    setPageNumber(citationPage);
  }, [citation.id, citationPage]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const boundingBoxes = citation.locations
    .filter((location) => location.page === pageNumber)
    .flatMap((location) => location.bounding_boxes);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-(--ink)/30 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label={`${citation.book_title} by ${citation.book_author}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="flex h-[calc(100vh-2rem)] w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-(--line) bg-(--surface-1) shadow-[0_20px_60px_rgba(30,30,30,0.15)]">
        {/* Header */}
        <header className="flex shrink-0 items-center justify-between border-b border-(--line) bg-(--surface-1) px-6 py-4">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-(--sage-light) text-(--sage-dark)">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
              </svg>
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-(--ink)">
                {citation.book_title}
              </p>

              <p className="mt-0.5 truncate text-xs text-(--muted)">
                {citation.book_author}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="ml-4 shrink-0 rounded-sm px-3 py-2 text-sm text-(--muted) transition-[background-color,color] duration-200 hover:bg-(--surface-2) hover:text-(--ink)"
            aria-label="Close PDF reader"
          >
            Close
          </button>
        </header>

        {/* PDF */}
        <div className="min-h-0 flex-1 overflow-auto bg-(--canvas-2)">
          <div className="flex min-h-full items-start justify-center p-6 sm:p-8">
            <Document
              file={url}
              onLoadSuccess={({ numPages }) => {
                setNumPages(numPages);
              }}
              onLoadError={(error) => {
                console.error("PDF LOAD ERROR:", error);
              }}
              loading={
                <div className="rounded-md border border-(--line) bg-(--surface-1) px-8 py-10 text-sm text-(--subtle) shadow-sm">
                  Opening book...
                </div>
              }
            >
              <div className="relative overflow-hidden rounded-sm bg-white shadow-[0_4px_20px_rgba(30,30,30,0.12)]">
                <Page
                  pageNumber={pageNumber}
                  renderTextLayer
                  renderAnnotationLayer
                  onLoadSuccess={(page) => {
                    setPageSize({
                      width: page.originalWidth,
                      height: page.originalHeight,
                    });
                  }}
                  loading={
                    <div className="flex h-125 w-100 items-center justify-center bg-white">
                      <span className="text-sm text-(--subtle)">
                        Opening page {pageNumber}...
                      </span>
                    </div>
                  }
                />

                {pageSize.width > 0 &&
                  pageSize.height > 0 &&
                  boundingBoxes.map((box, index) => {
                    const left =
                      (box.left / pageSize.width) * 100;

                    const width =
                      ((box.right - box.left) /
                        pageSize.width) *
                      100;

                    const top =
                      ((pageSize.height - box.bottom) /
                        pageSize.height) *
                      100;

                    const height =
                      ((box.bottom - box.top) /
                        pageSize.height) *
                      100;

                    return (
                      <div
                        key={`${pageNumber}-${index}`}
                        className="pointer-events-none absolute border border-(--amber)/40 bg-(--amber)/10"
                        style={{
                          left: `${left}%`,
                          top: `${top}%`,
                          width: `${width}%`,
                          height: `${height}%`,
                        }}
                      />
                    );
                  })}
              </div>
            </Document>
          </div>
        </div>

        {/* Navigation */}
        <footer className="flex shrink-0 items-center justify-center gap-5 border-t border-(--line) bg-(--surface-1) px-6 py-3">
          <button
            type="button"
            onClick={() => setPageNumber((page) => page - 1)}
            disabled={pageNumber <= 1}
            className="rounded-sm border border-(--line) px-4 py-2 text-sm text-(--ink) transition-[background-color,border-color] duration-200 hover:border-(--sage-light) hover:bg-(--surface-2) disabled:cursor-not-allowed disabled:opacity-35"
          >
            Previous
          </button>

          <span className="min-w-28 text-center text-sm tabular-nums text-(--muted)">
            Page {pageNumber}
            {numPages !== null && ` of ${numPages}`}
          </span>

          <button
            type="button"
            onClick={() => setPageNumber((page) => page + 1)}
            disabled={
              numPages === null || pageNumber >= numPages
            }
            className="rounded-sm bg-(--sage) px-4 py-2 text-sm font-medium text-white transition-[background-color] duration-200 hover:bg-(--sage-dark) disabled:cursor-not-allowed disabled:opacity-35"
          >
            Next
          </button>
        </footer>
      </div>
    </div>
  );
}
