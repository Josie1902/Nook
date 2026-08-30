"use client";

import { useRef } from "react";

import { LibraryScene } from "@/components/features/auth/LibraryScene";
import { useCatController } from "@/hooks/auth/useCatController";
import { AuthProvider } from "./AuthContext";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({
  children,
}: AuthLayoutProps) {
  const sceneRef =
    useRef<HTMLElement | null>(null);

  const cat = useCatController({
    sceneRef,
  });

  return (
    <AuthProvider
      notifyFieldsFilled={cat.notifyFieldsFilled}
    >
      <main className="min-h-screen">
        <div className="grid min-h-screen lg:grid-cols-2">
          {/* Library */}

          <LibraryScene
            sceneRef={sceneRef}
            cat={cat}
          />

          {/* Auth */}

          <div className="flex min-h-screen items-center justify-center px-6 py-12">
            {children}
          </div>
        </div>
      </main>
    </AuthProvider>
  );
}