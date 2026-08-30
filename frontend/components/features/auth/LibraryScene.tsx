"use client";

import type { RefObject } from "react";

import type {
  CatController,
} from "../../../hooks/auth/useCatController";

import { Desk } from "./Desk";

import "./pixel-mouse-cursor.css";
import { AuthNook } from "../cat/AuthNook";

function ShelfDivider() {
  return (
    <div
      className="
        h-1
        shrink-0
        border-y
        border-[#6d4f3a]
        bg-[#805f46]
        shadow-[0_2px_2px_rgba(30,30,30,0.12)]
      "
    />
  );
}

function Book({
  color,
  height,
}: {
  color: string;
  height: number;
}) {
  return (
    <i
      className={`
        w-3.75
        shrink-0
        border
        border-black/20
        ${color}
      `}
      style={{ height }}
    />
  );
}

interface LibrarySceneProps {
  sceneRef: RefObject<HTMLElement | null>;
  cat: CatController;
}

export function LibraryScene({
  sceneRef,
  cat,
}: LibrarySceneProps) {
  return (
    <section
      ref={sceneRef}
      className="
        mouse
        library-scene
        relative
        flex
        min-h-screen
        flex-col
        overflow-hidden
        bg-[#f2efea]
        px-6
        py-7
        lg:px-14
        lg:py-12
      "
      onPointerEnter={cat.enterScene}
      onPointerLeave={cat.leaveScene}
    >
      {/* Heading */}

      <div
        className="
          mb-5
          mt-1
          font-(family-name:--font-cormorant)
          text-[28px]
          font-semibold
          tracking-[-0.2px]
          lg:mb-9
        "
      >
        Nook

      </div>

      {/* Bookshelf */}

      <div
        className="
          relative
          flex
          min-h-65
          flex-1
          flex-col
          gap-2
          border-[6px]
          border-[#7a5a41]
          bg-[#987257]
          p-2.5
          shadow-[inset_0_0_0_6px_rgba(30,30,30,0.08)]
        "
      >
        {/* Top shelf */}

        <div
          className="
            relative
            flex
            flex-1
            items-end
            gap-1.25
            px-1
            pb-1
          "
        >
          <Book color="bg-[var(--red)]" height={58} />
          <Book color="bg-[var(--moss)]" height={46} />
          <Book color="bg-[var(--navy)]" height={46} />
          <Book color="bg-[var(--amber)]" height={58} />
          <Book color="bg-[var(--moss)]" height={46} />
          <Book color="bg-[var(--red)]" height={46} />
          <Book color="bg-[var(--teal)]" height={58} />
          <Book color="bg-[var(--navy)]" height={46} />
          <Book color="bg-[var(--plum)]" height={52} />
          <Book color="bg-[var(--amber)]" height={43} />
          <Book color="bg-[var(--red)]" height={55} />
          <Book color="bg-[var(--teal)]" height={48} />
          <Book color="bg-[var(--moss)]" height={54} />
          <Book color="bg-[var(--navy)]" height={42} />
          <Book color="bg-[var(--amber)]" height={51} />
          <Book color="bg-[var(--moss)]" height={46} />
          <Book color="bg-[var(--red)]" height={57} />
        </div>

        <ShelfDivider />

        {/* Middle shelf */}

        <div
          className="
            relative
            flex
            flex-1
            items-end
            gap-1.25
            px-1
            pb-1
          "
        >
          <Book color="bg-[var(--plum)]" height={50} />
          <Book color="bg-[var(--red)]" height={50} />
          <Book color="bg-[var(--navy)]" height={44} />
          <Book color="bg-[var(--amber)]" height={57} />
          <Book color="bg-[var(--moss)]" height={45} />
          <Book color="bg-[var(--teal)]" height={52} />
          <Book color="bg-[var(--plum)]" height={43} />
          <Book color="bg-[var(--red)]" height={57} />

          <div className="ml-auto flex shrink-0 items-end">
            <AuthNook
              state={cat.state}
              eyeOffset={cat.eyeOffset}
            />
          </div>
        </div>

        <ShelfDivider />

        {/* Bottom shelf */}

        <div
          className="
            relative
            flex
            flex-1
            items-end
            gap-1.25
            px-1
            pb-1
          "
        >
          <Book color="bg-[var(--navy)]" height={44} />
          <Book color="bg-[var(--amber)]" height={55} />
          <Book color="bg-[var(--moss)]" height={44} />
          <Book color="bg-[var(--plum)]" height={55} />
          <Book color="bg-[var(--red)]" height={47} />
          <Book color="bg-[var(--teal)]" height={58} />
          <Book color="bg-[var(--navy)]" height={42} />
          <Book color="bg-[var(--amber)]" height={51} />
          <Book color="bg-[var(--moss)]" height={46} />
          <Book color="bg-[var(--red)]" height={57} />
          <Book color="bg-[var(--plum)]" height={43} />
          <Book color="bg-[var(--teal)]" height={52} />
          <Book color="bg-[var(--amber)]" height={45} />
        </div>
      </div>

      <Desk />

      {/* Caption */}

      <p
        className="
          mt-5.5
          max-w-[32ch]
          font-(family-name:--font-cormorant)
          text-[15px]
          italic
          leading-normal
          text-[#5e5e5e]
          max-lg:hidden
        "
      >
        A quiet little nook, kept by a librarian who would rather be reading.
      </p>
    </section>
  );
}