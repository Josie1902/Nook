"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";

interface AuthContextValue {
  notifyFieldsFilled: (filled: boolean) => void;
}

const AuthContext =
  createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
  notifyFieldsFilled: (filled: boolean) => void;
}

export function AuthProvider({
  children,
  notifyFieldsFilled,
}: AuthProviderProps) {
  return (
    <AuthContext.Provider
      value={{
        notifyFieldsFilled,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider"
    );
  }

  return context;
}