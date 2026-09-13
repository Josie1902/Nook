"use client";

import { motion } from "motion/react";

interface BookSpineProps {
  title: string;
  color: string;
  index: number;
  newlyShelved?: boolean;
  onOpen?: () => void;
}

const heights = ["h-36", "h-40", "h-44", "h-38"];

export function BookSpine({
  title,
  color,
  index,
  newlyShelved = false,
  onOpen,
}: BookSpineProps) {
  const height = heights[index % heights.length];

  const truncatedTitle =
    title.length > 10 ? `${title.slice(0, 11)}...` : title;

  return (
    <motion.button
      type="button"
      aria-label={`Open ${title}`}
      onClick={onOpen}
      initial={{
        opacity: 0,
        y: 24,
        scale: 0.96,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      transition={{
        duration: newlyShelved ? 0.7 : 0.45,
        delay: index * 0.06,
        ease: [0.2, 0.8, 0.2, 1],
      }}
      whileHover={{
        y: -8,
        rotate: index % 2 === 0 ? -1 : 1,
      }}
      whileTap={{
        y: -4,
        scale: 0.98,
      }}
      className={`
        ${height}
        relative
        w-12
        shrink-0
        overflow-hidden
        rounded-t-[3px]
        border-l
        border-black/10
        text-left
        shadow-[2px_4px_8px_rgba(30,30,30,0.12)]
        transition-shadow
        hover:shadow-[4px_10px_16px_rgba(30,30,30,0.15)]
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-(--sage)
        focus-visible:ring-offset-2
        focus-visible:ring-offset-(--canvas)
      `}
      style={{
        backgroundColor: color,
      }}
    >
      <span
        className="
          absolute
          inset-y-0
          left-1/2
          flex
          -translate-x-1/2
          items-start
          overflow-hidden
          whitespace-nowrap
          text-[9px]
          font-medium
          tracking-wide
          text-white/90
          [writing-mode:vertical-rl]
        "
      >
        {truncatedTitle}
      </span>

      <span
        aria-hidden="true"
        className="
          absolute
          bottom-2
          left-2
          right-2
          h-px
          bg-white/20
        "
      />
    </motion.button>
  );
}