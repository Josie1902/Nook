"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { AnimatePresence, motion } from "motion/react";

import { BookDropState } from "@/types/book-drop-state";
import { cn } from "@/lib/utils/cn";
import { useCatBlink } from "@/hooks/auth/useCatBlink";

import "./Nook.css";

interface HomeNookProps {
  state: BookDropState;

  eyeOffset?: {
    x: number;
    y: number;
  };
}

/* ============================================================
   SPARKLES
   ============================================================ */

function CatSparkles({ play }: { play: boolean }) {
  const sparkles = [
    {
      x: 45,
      y: 27,
      dx: -10,
      dy: -13,
      delay: 0,
      scale: 0.8,
    },
    {
      x: 62,
      y: 20,
      dx: 0,
      dy: -17,
      delay: 0.06,
      scale: 1,
    },
    {
      x: 79,
      y: 28,
      dx: 11,
      dy: -13,
      delay: 0.12,
      scale: 0.85,
    },
    {
      x: 88,
      y: 39,
      dx: 15,
      dy: -3,
      delay: 0.18,
      scale: 0.65,
    },
  ];

  return (
    <svg
      className="
        pointer-events-none
        absolute
        left-1/2
        top-0
        z-20
        -translate-x-1/2
        overflow-visible
      "
      width="210"
      height="162"
      viewBox="0 0 125 80"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {sparkles.map((sparkle, index) => (
        <motion.g
          key={index}
          initial={{
            opacity: 0,
            x: 0,
            y: 3,
            scale: 0.25,
          }}
          animate={
            play
              ? {
                  opacity: [0, 1, 1, 0],
                  x: [0, sparkle.dx],
                  y: [3, sparkle.dy],
                  scale: [
                    0.25,
                    sparkle.scale,
                    sparkle.scale * 0.7,
                  ],
                }
              : {
                  opacity: 0,
                }
          }
          transition={{
            duration: 0.65,
            delay: sparkle.delay,
            ease: "easeOut",
            times: [0, 0.18, 0.55, 1],
          }}
        >
          <path
            d={`
              M ${sparkle.x} ${sparkle.y - 4}
              H ${sparkle.x + 1}
              V ${sparkle.y - 1}
              H ${sparkle.x + 4}
              V ${sparkle.y + 1}
              H ${sparkle.x + 1}
              V ${sparkle.y + 4}
              H ${sparkle.x - 1}
              V ${sparkle.y + 1}
              H ${sparkle.x - 4}
              V ${sparkle.y - 1}
              H ${sparkle.x - 1}
              V ${sparkle.y - 4}
              Z
            `}
            className="fill-(--accent)"
          />
        </motion.g>
      ))}
    </svg>
  );
}

/* ============================================================
   PIXEL CAT
   ============================================================ */

export function HomeNook({
  state,
  eyeOffset = { x: 0, y: 0 },
}: HomeNookProps) {
  /*
   * ----------------------------------------------------------
   * BOOK DROP STATE
   * ----------------------------------------------------------
   *
   * dropping  -> excited
   * complete  -> excited
   * otherwise -> idle
   */
  const isExcited =
    state === "dropping" ||
    state === "complete";

  /*
   * ----------------------------------------------------------
   * SPARKLE TRIGGER
   * ----------------------------------------------------------
   *
   * We only want the sparkle animation to happen when the cat
   * ENTERS the complete state.
   *
   * This prevents the sparkles from replaying on every render
   * while state remains "complete".
   */
  const previousState = useRef<BookDropState | undefined>(
    undefined,
  );

  const [sparkleKey, setSparkleKey] = useState(0);

  useEffect(() => {
    const enteredComplete =
      state === "complete" &&
      previousState.current !== "complete";

    if (enteredComplete) {
      setSparkleKey((key) => key + 1);
    }

    previousState.current = state;
  }, [state]);

  /*
   * ----------------------------------------------------------
   * EYE POSITION
   * ----------------------------------------------------------
   */
  const style = {
    "--eye-x": `${eyeOffset.x}px`,
    "--eye-y": `${eyeOffset.y}px`,
  } as CSSProperties;

  /*
   * ----------------------------------------------------------
   * BLINK
   * ----------------------------------------------------------
   *
   * Blink while idle.
   *
   * During dropping/complete the cat is excited, so blinking
   * is temporarily disabled.
   */

  const isBlinking = useCatBlink(!isExcited);

  return (
    <motion.div
      className="
        relative
        z-10
        flex
        flex-col
        items-center
      "
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.5,
        ease: [0.2, 0.8, 0.2, 1],
      }}
    >
      {/* =====================================================
          SPARKLES

          The key forces a fresh animation whenever the cat
          enters "complete".
          ===================================================== */}

      <AnimatePresence>
        {state === "complete" && (
          <CatSparkles
            key={sparkleKey}
            play={true}
          />
        )}
      </AnimatePresence>

      {/* =====================================================
          PIXEL CAT
          ===================================================== */}

      <motion.svg
        width="210"
        height="162"
        viewBox="0 0 125 80"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="crispEdges"
        aria-hidden="true"
        style={style}
        className={cn(
          "pixel-cat",
          isBlinking && "pixel-cat--blinking",
        )}
        animate={
          isExcited
            ? {
                y: [0, -5, 0],
              }
            : {
                y: 0,
              }
        }
        transition={{
          duration: 0.45,
          repeat: isExcited ? 1 : 0,
          ease: "easeInOut",
        }}
      >
        {/* =====================================================
            CAT
            ===================================================== */}

        <g id="cat" className="cat-layer">
          {/* ===================================================
              EAR
              =================================================== */}

          <g id="left-ear" className="cat-ear">
            <path
              d="
                M52 32
                H57
                V36.5
                Q58 38.8 61 38
                V41
                H66
                V37
                H68.5
                Q71 35.8 70 32
                H75
                V45
                H80
                V59.5
                L79 60.5
                V61
                H43
                V57
                H45
                V47.5
                H48
                V41
                H52
                Z
              "
            />
          </g>

          {/* ===================================================
              LEFT CHEEK
              =================================================== */}

          <g id="left-cheek" className="cat-cheek">
            <path
              d="
                M43 57
                L40 66.5
                V70.5
                L35.5 74
                L30 70.5
                V66.5
                L34 60.5
                L36 53.5
                L35 45

                Q34 41 28 42

                Q27 46 30 47.5
                V54.5
                L23 66.5
                V73.5
                L25.5 75
                L27 77.5

                Q29.3 81.3 36.5 80

                L41 90
                H48
                V61
                Z
              "
            />
          </g>

          {/* ===================================================
              RIGHT CHEEK
              =================================================== */}

          <g id="right-cheek" className="cat-cheek">
            <path
              d="
                M75 45
                H80
                V59.5
                L79 60.5
                V85.5
                L78 88
                L64.5 90
                L63.5 91
                H49.5
                L48.5 90
                H48
                V61
                H75
                Z
              "
            />
          </g>

          {/* ===================================================
              CENTRAL BODY
              =================================================== */}

          <g id="body" className="cat-body">
            <path
              d="
                M48 61
                H79
                V78
                H78
                V84
                Z
              "
            />
          </g>

          {/* ===================================================
              BODY BASE / FEET
              =================================================== */}

          <g id="body-base" className="cat-body-base">
            <path
              d="
                M41 76
                Q37 79 36.5 80
                L41 90
                L48.5 90
                L49.5 91
                H63.5
                L64.5 90
                L78 88
                L79 85.5
                V78
                H76
                V84
                H72
                H65
                V89
                Z
              "
            />
          </g>
        </g>

        {/* =====================================================
            FACE
            ===================================================== */}

        <motion.g
          id="eyes"
          className="cat-eyes"
          style={{
            transform:
              "translate(var(--eye-x), var(--eye-y))",
          }}
        >
          <rect
            id="left-eye"
            x="57"
            y="50"
            width="5"
            height="4"
            fill="#dc9906"
          />

          <rect
            id="right-eye"
            x="70"
            y="50"
            width="5"
            height="4"
            fill="#dc9906"
          />
        </motion.g>
      </motion.svg>

      {/* =====================================================
          LABEL
          ===================================================== */}

      <motion.p
        animate={{
          opacity: isExcited ? 1 : 0.7,
        }}
        className="
          mt-1
          text-xs
          font-medium
          text-(--muted)
        "
      >
        {isExcited ? "A Book for Nook!" : "Nook"}
      </motion.p>
    </motion.div>
  );
}
