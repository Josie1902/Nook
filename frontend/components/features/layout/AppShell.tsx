import { mockUser } from "@/lib/mock/mock-user";
import type { ReactNode } from "react";
import { Navbar } from "./Navbar";


interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-(--canvas) text-(--ink)">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-6 md:px-8 md:py-10">
        {children}
      </main>
    </div>
  );
}