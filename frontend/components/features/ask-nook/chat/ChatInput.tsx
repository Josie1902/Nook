"use client";

import { UiActivityState } from "@/types/ask-nook";
import { useState, type KeyboardEvent } from "react";

interface ChatInputProps {
  activity: UiActivityState;
  onSend: (content: string) => void;
}

function ActivityLabel({ activity }: { activity: UiActivityState }) {
  const label =
    activity === "sleeping"
      ? "Nook is sleeping"
      : activity === "awake"
        ? "Nook is awake"
        : "Nook is thinking…";

  return (
    <div className="flex items-center gap-2">
      {/* Cat */}
      <div className="relative h-10 w-10 shrink-0">
        <img
          src="/awake_cat.png"
          alt="Nook"
          className="h-full w-full object-contain"
        />

        {/* Sleeping Zs */}
        {activity === "sleeping" && (
          <div className="pointer-events-none absolute -right-1 -top-3 flex items-end">
            <span className="animate-[float_2s_ease-in-out_infinite] text-xs font-semibold text-(--navy)">
              z
            </span>
            <span className="animate-[float_2s_ease-in-out_0.4s_infinite] text-sm font-semibold text-(--navy)">
              z
            </span>
            <span className="animate-[float_2s_ease-in-out_0.8s_infinite] text-base font-semibold text-(--navy)">
              z
            </span>
          </div>
        )}

        {/* Thinking lightbulb */}
        {activity === "thinking" && (
          <div className="pointer-events-none absolute -right-2 -top-3 animate-pulse text-lg">
            💡
          </div>
        )}
      </div>

      {/* Status */}
      <div className="flex flex-col justify-center">
        <span className="text-xs font-medium text-(--ink)">{label}</span>

        {activity === "sleeping" && (
          <span className="text-[11px] text-(--subtle)">
            Ask me something to wake me up
          </span>
        )}

        {activity === "thinking" && (
          <span className="text-[11px] text-(--subtle)">
            Finding something in your books…
          </span>
        )}
      </div>
    </div>
  );
}

export function ChatInput({ activity, onSend }: ChatInputProps) {
  const [value, setValue] = useState("");

  const inputDisabled = activity !== "sleeping";

  function submit() {
    const trimmed = value.trim();

    if (!trimmed || inputDisabled) return;

    onSend(trimmed);
    setValue("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <div className="border-t border-(--line) bg-(--surface-1)">
      {/* Nook state */}
      <div className="px-4 pt-3 pb-2">
        <ActivityLabel activity={activity} />
      </div>

      {/* Chat input */}
      <div className="flex items-end gap-2 px-4 pb-3">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={inputDisabled}
          rows={1}
          placeholder={
            activity === "sleeping"
              ? "Ask Nook…"
              : "Nook is thinking…"
          }
          className="
            max-h-32 flex-1 resize-none rounded-md
            border border-(--line)
            bg-(--canvas)
            px-3 py-2
            text-sm text-(--ink)
            placeholder:text-(--subtle)
            focus:border-(--sage)
            focus:outline-none
            disabled:cursor-wait
            disabled:bg-(--surface-2)
            disabled:text-(--subtle)
          "
        />

        <button
          type="button"
          onClick={submit}
          disabled={inputDisabled || !value.trim()}
          className="
            rounded-sm
            bg-(--sage)
            px-4 py-2
            text-sm font-medium text-white
            transition-colors
            hover:bg-(--sage-dark)
            disabled:cursor-not-allowed
            disabled:bg-(--surface-3)
            disabled:text-(--subtle)
          "
        >
          {activity === "thinking" ? "Thinking…" : "Send"}
        </button>
      </div>
    </div>
  );
}

