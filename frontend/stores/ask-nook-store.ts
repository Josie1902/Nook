"use client";

import { create } from "zustand";

export const MIN_SOURCE_PANEL_WIDTH = 280;
export const MAX_SOURCE_PANEL_WIDTH = 560;

export type NookMode =
  | "sleeping"
  | "thinking"
  | "deviation";

type AskNookState = {
  activeSessionId: string;
  isReadingLogOpen: boolean;
  sourcePanelWidth: number;
  nookMode: NookMode;
  draft: string;

  setActiveSession: (id: string) => void;
  toggleReadingLog: () => void;
  setSourcePanelWidth: (width: number) => void;
  setDraft: (draft: string) => void;
  askQuestion: () => void;
  startNewSession: () => void;
  stayInSession: () => void;
};

export const useAskNookStore = create<AskNookState>((set) => ({
  activeSessionId: "session-1",

  isReadingLogOpen: true,

  sourcePanelWidth: 380,

  nookMode: "sleeping",

  draft: "",

  setActiveSession: (id) => {
    set({
      activeSessionId: id,
    });
  },

  toggleReadingLog: () => {
    set((state) => ({
      isReadingLogOpen: !state.isReadingLogOpen,
    }));
  },

  setSourcePanelWidth: (width) => {
    set({
      sourcePanelWidth: Math.min(
        MAX_SOURCE_PANEL_WIDTH,
        Math.max(MIN_SOURCE_PANEL_WIDTH, width),
      ),
    });
  },

  setDraft: (draft) => {
    set({
      draft,
    });
  },

  askQuestion: () => {
    set({
      nookMode: "thinking",
    });
  },

  startNewSession: () => {
    set({
      nookMode: "sleeping",
      draft: "",
    });
  },

  stayInSession: () => {
    set({
      nookMode: "sleeping",
    });
  },
}));