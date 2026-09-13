"use client";

import { useState } from "react";
import { motion } from "motion/react";

import { HomeNook } from "../cat/HomeNook";
import { BookDrop } from "./BookDrop";
import { BookDropState } from "@/types/book-drop-state";

export function NookScene() {
  const [dropState, setDropState] =
    useState<BookDropState>("idle");

  return (
    <section
      aria-label="Nook book drop"
      className="
        relative
        h-full
        overflow-hidden
        rounded-xl
        border
        border-(--line)
        bg-(--canvas-2)
      "
    >
      <div
        aria-hidden="true"
        className="
          absolute
          inset-x-0
          bottom-0
          h-24
          bg-(--surface-3)
        "
      />

      <motion.div
        aria-hidden="true"
        className="
          absolute
          left-1/2
          top-12
          h-56
          w-56
          -translate-x-1/2
          rounded-full
          bg-(--sage-light)
          opacity-30
          blur-3xl
        "
        animate={{
          scale: [1, 1.04, 1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div
        className="
          relative
          flex
          h-full
          min-h-90
          items-end
          justify-center
          gap-6
          px-6
          pb-16
          pt-16
          sm:gap-10
          sm:px-12
        "
      >
        <HomeNook state={dropState} />

        <BookDrop
          state={dropState}
          onStateChange={setDropState}
        />
      </div>
    </section>
  );
}