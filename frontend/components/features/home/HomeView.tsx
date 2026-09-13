"use client";

import { useEffect } from "react";

import { useBookStore } from "@/stores/book-store";

import { WelcomeHeader } from "./WelcomeHeader";
import { NookScene } from "./NookScene";
import { LibrarianQueue } from "./LibrarianQueue";
import { BookShelf } from "./BookShelf";
import { AskNookCard } from "./AskNookCard";

export function HomeView() {
  const loadBooks = useBookStore((state) => state.loadBooks);

  useEffect(() => {
    void loadBooks();
  }, [loadBooks]);

  return (
    <>
      <WelcomeHeader />

      <div className="flex gap-4">
        <div className="min-w-0 flex-3 h-full">
          <NookScene />
        </div>
        <div className="min-w-0 flex-1 mt-">
          <AskNookCard />
        </div>
      </div>

      <LibrarianQueue />

      <BookShelf />
    </>
  );
}