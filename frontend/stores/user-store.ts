import { create } from "zustand";

import type { User } from "@/types/user";

interface UserState {
  user: User;
  setName: (name: string) => void;
  setUser: (user: User) => void;
  clearUser: () => void;
}

const initialUser: User = {
  id: "user-1",
  name: "User",
};

export const useUserStore = create<UserState>((set) => ({
  user: initialUser,

  setName: (name) =>
    set((state) => ({
      user: {
        ...state.user,
        name,
      },
    })),

  setUser: (user) => set({ user }),

  clearUser: () =>
    set({
      user: initialUser,
    }),
}));