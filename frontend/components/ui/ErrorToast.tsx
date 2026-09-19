"use client";

import Image from "next/image";
import { useEffect } from "react";
import { toast } from "sonner";
import { CircleAlert } from "lucide-react";

import { useAppErrorStore } from "@/stores/app-error-store";

export function GlobalErrorToaster() {
  const error = useAppErrorStore((state) => state.error);
  const clearError = useAppErrorStore((state) => state.clearError);

  useEffect(() => {
    if (!error) return;

    toast.custom(
      () => (
        <div
          className="
            flex w-90 items-center gap-3
            rounded-lg
            border border-(--line)
            bg-(--surface-1)
            p-3
            text-(--ink)
            shadow-[0_8px_24px_rgba(30,30,30,0.10)]
          "
        >
          {/* ─────────────────────────────────────
              Cat illustration
          ───────────────────────────────────── */}

          <div
            className="
              relative h-12 w-12 shrink-0
              overflow-visible
              rounded-md
              bg-(--surface-2)
            "
          >
            <Image
              src="/awake_cat.png"
              alt=""
              fill
              className="
                rounded-md
                object-cover
              "
              sizes="48px"
            />

            {/* Error badge */}
            <div
              className="
                absolute -right-1.5 -top-1.5
                flex h-5 w-5 items-center justify-center
                rounded-full
                border-2 border-(--surface-1)
                bg-(--red)
              "
            >
              <CircleAlert
                className="h-3 w-3 text-white"
                strokeWidth={2.5}
              />
            </div>
          </div>

          {/* ─────────────────────────────────────
              Message
          ───────────────────────────────────── */}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p
                className="
                  text-sm font-semibold
                  tracking-[-0.01em]
                  text-(--ink)
                "
              >
                Something went wrong
              </p>
            </div>

            <p
              className="
                mt-1
                line-clamp-2
                text-sm leading-5
                text-(--muted)
              "
            >
              {error instanceof Error
                ? error.message
                : "Please try again."}
            </p>
          </div>
        </div>
      ),
      {
        duration: 5000,
        position: "bottom-right",
      },
    );

    clearError();
  }, [error, clearError]);

  return null;
}
