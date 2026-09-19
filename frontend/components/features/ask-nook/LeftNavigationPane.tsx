"use client";

import { createSession, deleteSession, getSessions } from "@/lib/api/session";
import { Session } from "@/lib/api/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useAppErrorStore } from "@/stores/app-error-store";

type LeftNavigationPaneProps = {
  isOpen: boolean;
  onToggle: () => void;
  activeSessionId: string | null;
  setActiveSessionId: (sessionId: string) => void;
   sessionRefreshKey: number;
};

export function LeftNavigationPane({
  isOpen,
  onToggle,
  activeSessionId,
  setActiveSessionId,
  sessionRefreshKey
}: LeftNavigationPaneProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function loadSessions() {
      try {
        setIsLoading(true);
        setError(null);

        const data = await getSessions();

        if (!cancelled) {
          setSessions(data);
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load sessions.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadSessions();

    return () => {
      cancelled = true;
    };
  }, [sessionRefreshKey]);


  async function handleCreateSession() {
    const session = await createSession();

    setActiveSessionId(session.id);
    router.push(`/ask-nook?session=${encodeURIComponent(session.id)}`);
  }

  async function handleDeleteSession(
    event: React.MouseEvent<HTMLButtonElement>,
    sessionId: string,
  ) {
    event.preventDefault();
    event.stopPropagation();

    try {
      await deleteSession(sessionId);

      setSessions((prev) =>
        prev.filter((session) => session.id !== sessionId),
      );

      if (sessionId === activeSessionId) {
        setActiveSessionId("");
        router.push("/ask-nook");
      }
    } catch (err) {
      useAppErrorStore.getState().setError(error);
    }
  }

  if (!isOpen) {
    return (
      <aside className="flex w-12 shrink-0 flex-col border-r border-neutral-200 bg-white">
        <button
          type="button"
          onClick={onToggle}
          aria-label="Expand navigation"
          className="flex h-12 w-full items-center justify-center text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
        >
          →
        </button>
      </aside>
    );
  }

  return (
    <aside className="flex w-80 shrink-0 flex-col border-r border-neutral-200 bg-white">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-neutral-200 px-4">
        <span className="text-sm font-medium tracking-wide text-neutral-900">
          Nook
        </span>

        <button
          type="button"
          onClick={onToggle}
          aria-label="Collapse navigation"
          className="flex h-7 w-7 items-center justify-center text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
        >
          ←
        </button>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col">
        {/* Home */}
        <div className="border-b border-neutral-200 p-2">
          <Link
            href="/"
            className="flex items-center px-3 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-neutral-950"
          >
            Home
          </Link>
        </div>

        {/* Sessions */}
        <div className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
          <div className="flex items-center justify-between px-3 pb-3">
            <div className="text-xs font-medium uppercase tracking-wider text-neutral-400">
              Sessions
            </div>

            <button
              type="button"
              onClick={handleCreateSession}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-[#486047] transition-colors hover:bg-[#c9d9c4] hover:text-[#486047]"
            >
              <span className="text-sm leading-none">+</span>
              New
            </button>
          </div>

          {isLoading && (
            <p className="px-3 py-2 text-sm text-neutral-400">
              Loading sessions…
            </p>
          )}

          {!isLoading && error && (
            <p className="px-3 py-2 text-sm text-neutral-500">
              {error}
            </p>
          )}

          {!isLoading && !error && sessions.length === 0 && (
            <p className="px-3 py-2 text-sm text-neutral-400">
              No reading sessions yet.
            </p>
          )}

          {!isLoading && !error && sessions.length > 0 && (
            <div className="space-y-0.5">
              {sessions.map((session) => {
                const isActive = session.id === activeSessionId;

                return (
                  <Link
                    key={session.id}
                    href={`/ask-nook?session=${encodeURIComponent(session.id)}`}
                    onClick={() => setActiveSessionId(session.id)}
                    className={[
                      "group flex items-center gap-2 px-3 py-2.5 transition-colors",
                      isActive
                        ? "bg-neutral-100 text-neutral-950"
                        : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-950",
                    ].join(" ")}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">
                        {session.topic || "Untitled session"}
                      </div>
                  
                      <time
                        dateTime={session.created_at}
                        className="mt-0.5 block text-xs text-neutral-400"
                      >
                        {formatSessionDate(session.created_at)}
                      </time>
                    </div>
                  
                    <button
                      type="button"
                      aria-label={`Delete ${session.topic || "session"}`}
                      onClick={(event) =>
                        handleDeleteSession(event, session.id)
                      }
                      className="shrink-0 rounded-md p-1.5 text-neutral-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
}

function formatSessionDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
