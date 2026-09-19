import { create } from "zustand";

interface AppErrorStore {
  error: unknown | null;
  setError: (error: unknown) => void;
  clearError: () => void;
}

export const useAppErrorStore = create<AppErrorStore>((set) => ({
  error: null,

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),
}));