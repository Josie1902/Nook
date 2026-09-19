"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ResearchSelectionResponse,
  SessionDetail,
} from "@/lib/api/types";
import { askQuestion } from "@/lib/api/session";
import {
  confirmResearchSelection,
  getSession,
  listMessages,
  refineResearch,
  startResearch,
} from "@/lib/api/session";
import { ResearchInput } from "./research/ResearchInput";
import { ResearchSelection } from "./research/ResearchSelection";
import { getBooks } from "@/lib/api/books";
import { BookSearchResult, ChatMessage, UiActivityState } from "@/types/ask-nook";
import { ChatThread } from "./chat/ChatThread";
import { ChatInput } from "./chat/ChatInput";

interface ChatSessionProps {
  activeSessionId: string | null;
  onSessionUpdated: () => void;
}

export function ChatSession({ activeSessionId, onSessionUpdated }: ChatSessionProps) {
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const [researchSelection, setResearchSelection] = useState<ResearchSelectionResponse | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activity, setActivity] = useState<UiActivityState>("sleeping");
  

  useEffect(() => {
    if (!activeSessionId) {
      setSession(null);
      setSessionLoading(false);
      setSessionError(null);
      setResearchSelection(null);
      return;
    }

    let cancelled = false;

    setSession(null);
    setSessionLoading(true);
    setSessionError(null);
    setResearchSelection(null);

    getSession(activeSessionId)
      .then((detail) => {
        if (!cancelled) {
          setSession(detail);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setSessionError(
            err instanceof Error
              ? err.message
              : "Couldn't load this session.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setSessionLoading(false);
        }
      });

    listMessages(activeSessionId)
    .then((response) => {
      if (!cancelled) {
        setMessages(
          response.map((message): ChatMessage => {
            if (message.role === "user") {
              return {
                id: message.id,
                role: "user",
                content: message.content,
                errorMessage: message.error_message,
                createdAt: message.created_at,
              };
            }
          
            return {
              id: message.id,
              role: "assistant",
              content: message.content,
              errorMessage: message.error_message,
              createdAt: message.created_at,
            };
          }),
        );
      }
    })
    .catch((err) => {
      if (!cancelled) {
        console.error("Couldn't load session messages.", err);
        setMessages([]);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [activeSessionId]);


  const handleStartResearch = useCallback(
    async (input: string) => {
      if (!activeSessionId) return;

      const response = await startResearch(activeSessionId, {
        input,
      });

      setResearchSelection(response);
    },
    [activeSessionId],
  );

  const handleRefine = useCallback(
    async (args: {
      topic: string;
      description: string;
      bookIds: string[];
      comments?: string;
    }) => {
      if (!activeSessionId) return;

      const response = await refineResearch(activeSessionId, {
        topic: args.topic,
        description: args.description,
        book_ids: args.bookIds,
        comments: args.comments ?? null,
      });

      setResearchSelection(response);
    },
    [activeSessionId],
  );

  const handleConfirm = useCallback(
    async (args: {
      topic: string;
      description: string;
      bookIds: string[];
    }) => {
      if (!activeSessionId) return;

      await confirmResearchSelection(
        activeSessionId,
        {
          topic: args.topic,
          description: args.description,
          book_ids: args.bookIds,
        },
      );


      const refreshed = await getSession(activeSessionId);

      setSession(refreshed);
      setResearchSelection(null);

      onSessionUpdated();
    },
    [activeSessionId],
  );

  const handleOnSearchBooks = async (
    query: string,
  ): Promise<BookSearchResult[]> => {
    const books = await getBooks();
    const search = query.toLowerCase();
  
    return books
      .filter((book) => {
        if (!book.title || !book.author) return false;
      
        return (
          book.title.toLowerCase().includes(search) ||
          book.author.toLowerCase().includes(search)
        );
      })
      .map((book) => ({
        bookId: book.id,
        title: book.title!,
        author: book.author!,
        coverUrl: book.cover_url
      }));
  };

  const hasResearch = Boolean(session?.topic?.trim()) && Boolean(session?.description?.trim());

  const handleSendChatMessage = useCallback(
  async (content: string) => {
    if (!activeSessionId) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: {
        text: content,
      },
      errorMessage: null,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setActivity("awake");

    try {
      setActivity("thinking");

      const response = await askQuestion(activeSessionId, {
        content,
      });

      const assistantMessage: ChatMessage = {
        id: response.assistant_message_id,
        role: "assistant",
        content: {
          segments: response.segments,
          citations: response.citations
        },
        errorMessage: null,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Couldn't send chat message.", err);

      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: {
          segments: [
            {
              text: "Sorry, I couldn't process that message.",
              citation_ids: [],
            },
          ],
          citations:[]
        },
        errorMessage:
          err instanceof Error
            ? err.message
            : "Couldn't process your message.",
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setActivity("sleeping");
    }
  },
  [activeSessionId],
);

  if (!activeSessionId) {
    return (
      <section className="flex min-w-0 flex-1 items-center justify-center">
        <div className="flex max-w-md flex-col items-center px-6 text-center">
          <img
            src="/awake_cat.png"
            alt="Nook"
            className="mb-4 h-20 w-20 object-contain"
          />
  
          <h2 className="text-lg font-semibold">
            Your reading space
          </h2>
    
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Select a session or create one to start chatting.
          </p>
        </div>
      </section>
    );
  }


  if (sessionLoading) {
    return (
      <section className="flex min-w-0 flex-1 items-center justify-center">
        Loading session...
      </section>
    );
  }

  if (sessionError) {
    return (
      <section className="flex min-w-0 flex-1 items-center justify-center">
        {sessionError}
      </section>
    );
  }

  if (!session) {
    return null;
  }


  return (
    <section className="flex min-w-0 min-h-0 flex-1 flex-col overflow-hidden">
      <div className="mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col gap-6 py-6">
        {hasResearch ? (
          <>
            {/* ====================================================== */}
            {/* RESEARCH HEADER                                        */}
            {/* ====================================================== */}
        
            <section className="shrink-0">
              <h1 className="text-2xl font-semibold">
                {session.topic}
              </h1>
        
              <p className="mt-2 text-sm text-muted-foreground">
                {session.description}
              </p>
            </section>
        
            <div className="shrink-0 border-t" />
        
            {/* ====================================================== */}
            {/* CHAT THREADS                                           */}
            {/* ====================================================== */}
        
            <section className="relative min-h-0 flex-1">
              {/* Scrollable chat */}
              <div className="absolute inset-0 overflow-y-auto pb-32">
                <ChatThread
                  messages={messages}
                />
              </div>
        
              {/* Bottom composer */}
              <div className="absolute inset-x-0 bottom-0 z-10">
                <ChatInput
                  activity={activity}
                  onSend={handleSendChatMessage}
                />
              </div>
            </section>
          </>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="flex flex-col gap-6 pb-6">
              {/* ====================================================== */}
              {/* 1. RESEARCH INPUT                                      */}
              {/* ====================================================== */}

              <section className="rounded-lg border p-6">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold">
                    Research
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    Tell Nook what you want to research.
                  </p>
                </div>

                <ResearchInput
                  onSubmit={handleStartResearch}
                />
              </section>

              {/* ====================================================== */}
              {/* 2. RESEARCH SELECTION                                 */}
              {/* ====================================================== */}

              <section className="rounded-lg border p-6">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold">
                    Research Selection
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    Review and refine the research direction and books.
                  </p>
                </div>

                {researchSelection ? (
                  <ResearchSelection
                    selection={researchSelection}
                    onRefine={handleRefine}
                    onConfirm={handleConfirm}
                    onSearchBooks={handleOnSearchBooks}
                  />
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Start a research request above to see Nook's
                    suggested research selection.
                  </div>
                )}
              </section>

              {/* ====================================================== */}
              {/* 3. CHAT                                                */}
              {/* ====================================================== */}

              <section className="rounded-lg border p-6">
                <h2 className="text-lg font-semibold">
                  Chat with Nook
                </h2>

                <p className="text-sm text-muted-foreground">
                  Confirm your research selection to start chatting.
                </p>
              </section>
            </div>
          </div>
        )}
        </div>
    </section>
  );
}
