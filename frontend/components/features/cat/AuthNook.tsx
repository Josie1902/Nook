import type { CSSProperties } from "react";
import "./Nook.css";
import { useCatBlink } from "../../../hooks/auth/useCatBlink";
import { cn } from "@/lib/utils/cn";

export type AuthNookState =
  | "sleeping"
  | "resting"
  | "alert";

interface AuthNookProps {
  state: AuthNookState;

  eyeOffset: {
    x: number;
    y: number;
  };

  blinking?: boolean;
}

export function AuthNook({
  state = "sleeping",
  eyeOffset = { x: 0, y: 0 },
}: AuthNookProps) {
  const style = {
    "--eye-x": `${eyeOffset.x}px`,
    "--eye-y": `${eyeOffset.y}px`,
  } as CSSProperties;

  const isBlinking =
  useCatBlink(
    state === "resting",
  );

  return (
    <svg
  width="200"
  height="102"
  viewBox="0 0 125 80"
  version="1.1"
  xmlns="http://www.w3.org/2000/svg"
  shapeRendering="crispEdges"
  aria-hidden="true"
  style={style}
  className={cn(
    "pixel-cat",
    `pixel-cat--${state}`,
    isBlinking &&
      "pixel-cat--blinking",
  )}
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

      <g
        id="eyes"
        className="cat-eyes"
        style={{
          transform: "translate(var(--eye-x), var(--eye-y))",
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
      </g>
    </svg>
  );
}