"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ChatMessage, Citation } from "@/types/ask-nook";
import { getPresignedUrl } from "@/lib/api/books";
import { useAppErrorStore } from "@/stores/app-error-store";

interface ChatThreadProps {
  messages: ChatMessage[];
}

const PdfReaderOverlay = dynamic(
  () => import("./PdfReaderOverlay").then((m) => m.PdfReaderOverlay),
  { ssr: false },
);

export function ChatThread({ messages }: ChatThreadProps) {
  const [expandedSegments, setExpandedSegments] = useState<Set<string>>(
    new Set(),
  );

  const [selectedCitation, setSelectedCitation] =
    useState<Citation | null>(null);

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);


  const handleCitationClick = async (citation: Citation) => {
  try {
    const response = await getPresignedUrl(citation.book_id);

    if (!response.url) {
      throw new Error("PDF URL was not returned.");
    }

    setPdfUrl(response.url);
    setSelectedCitation(citation);
  } catch (error) {
    useAppErrorStore.getState().setError(error);
  }
};


  const handleClosePdf = () => {
    setSelectedCitation(null);
    setPdfUrl(null);
  };

  const toggleSegmentCitations = (segmentKey: string) => {
    setExpandedSegments((current) => {
      const next = new Set(current);

      if (next.has(segmentKey)) {
        next.delete(segmentKey);
      } else {
        next.add(segmentKey);
      }

      return next;
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {messages.map((message) => (
        <div key={message.id} className="flex flex-col gap-1">
          <span className="text-xs font-medium text-(--subtle)">
            {message.role === "user" ? "You" : "Nook"}
          </span>

          {message.role === "user" ? (
            <p
              className={`whitespace-pre-wrap text-sm leading-relaxed ${
                message.errorMessage
                  ? "text-(--red)"
                  : "text-(--ink)"
              }`}
            >
              {message.content.text}
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {message.content.segments.map((segment, index) => {
                const allCitations = message.content.citations ?? [];

                const citationMap = new Map(
                  allCitations.map((citation) => [
                    citation.id,
                    citation,
                  ]),
                );

                const citations = segment.citation_ids
                  .map((citationId) => citationMap.get(citationId))
                  .filter(
                    (citation): citation is Citation =>
                      citation !== undefined,
                  );

                const segmentKey = `${message.id}-${index}`;
                const isExpanded = expandedSegments.has(segmentKey);

                return (
                  <div
                    key={segmentKey}
                    className="flex flex-col gap-2"
                  >
                    <p
                      className={`whitespace-pre-wrap text-sm leading-relaxed ${
                        message.errorMessage
                          ? "text-(--red)"
                          : "text-(--ink)"
                      }`}
                    >
                      {segment.text}

                      {citations.length > 0 && (
                        <>
                          {" "}
                          <button
                            type="button"
                            onClick={() =>
                              toggleSegmentCitations(segmentKey)
                            }
                            className="text-(--subtle) underline decoration-(--subtle) underline-offset-2 hover:text-(--ink)"
                            aria-expanded={isExpanded}
                            aria-label={`Show citation${
                              citations.length > 1 ? "s" : ""
                            } ${citations
                              .map((citation) => citation.order)
                              .join(", ")}`}
                          >
                            {citations
                              .map(
                                (citation) =>
                                  `[${citation.order}]`,
                              )
                              .join(" ")}
                          </button>
                        </>
                      )}
                    </p>

                    {isExpanded &&
                      citations.map((citation) => (
                        <div
                          key={citation.id}
                          className="border-l-2 border-(--line) pl-3"
                        >
                          <p className="text-sm italic leading-relaxed text-(--subtle)">
                            “{citation.quote}”
                          </p>

                          <div className="mt-2 flex flex-col gap-0.5 text-xs text-(--subtle)">
                            <span className="font-medium text-(--ink)">
                              {citation.book_title}
                            </span>

                            <div className="flex items-center gap-2">
                              <span>{citation.book_author}</span>
                              <span>·</span>
                              <span>
                                {citation.page_start ===
                                citation.page_end
                                  ? `p. ${citation.page_start}`
                                  : `pp. ${citation.page_start}–${citation.page_end}`}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                );
              })}

              {message.content.citations &&
                message.content.citations.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {message.content.citations.map((citation) => (
                      <button
                        key={citation.id}
                        type="button"
                        onClick={() =>
                          handleCitationClick(citation)
                        }
                        className="flex max-w-64 flex-col rounded-md border border-(--subtle) bg-(--surface) px-3 py-2 text-left text-xs transition hover:border-(--ink)"
                        aria-label={`Open ${citation.book_title}, page ${citation.page_start}`}
                      >
                        <span className="truncate font-medium text-(--ink)">
                          [{citation.order}] {citation.book_title}
                        </span>

                        <span className="text-(--subtle)">
                          {citation.page_start === citation.page_end
                            ? `p. ${citation.page_start}`
                            : `pp. ${citation.page_start}–${citation.page_end}`}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
            </div>
          )}
        </div>
      ))}

      {selectedCitation && pdfUrl && (
        <PdfReaderOverlay
          url={pdfUrl}
          citation={selectedCitation}
          onClose={handleClosePdf}
        />
      )}
    </div>
  );
}