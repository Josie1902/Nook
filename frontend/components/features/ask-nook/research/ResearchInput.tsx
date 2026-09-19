"use client";

import { useState } from "react";

import { useAppErrorStore } from "@/stores/app-error-store";

interface ResearchInputProps {
  onSubmit: (input: string) => Promise<void>;
  disabled?: boolean;
}

export function ResearchInput({
  onSubmit,
  disabled = false,
}: ResearchInputProps) {
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(
    event: React.SubmitEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const value = input.trim();

    if (!value || submitting || disabled) {
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit(value);
    } catch (error) {
      useAppErrorStore.getState().setError(error);
    } finally {
      setSubmitting(false);
    }
  }

  const isDisabled = disabled || submitting;

  return (
    <div className="flex flex-col gap-3">

      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          disabled={isDisabled}
          rows={3}
          placeholder="e.g. I want to understand the history of tea ceremonies in Japan"
          className="w-full resize-none rounded-md border border-(--line) bg-(--surface-1) px-3 py-2 text-sm text-(--ink) placeholder:text-(--subtle) focus:border-(--sage) focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        />

        <button
          type="submit"
          disabled={isDisabled || !input.trim()}
          className="self-start rounded-sm bg-(--sage) px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-(--sage-dark) disabled:cursor-not-allowed disabled:bg-(--surface-3) disabled:text-(--subtle)"
        >
          {submitting ? "Researching…" : "Continue"}
        </button>
      </form>
    </div>
  );
}