"use client";

import { AnimatePresence, motion } from "motion/react";
import { Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useUserStore } from "@/stores/user-store";
import { IconButton } from "@/components/ui/IconButton";
import { signOutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";

export function ProfileMenu() {
  const router = useRouter();

  const user = useUserStore((state) => state.user);
  const clearUser = useUserStore((state) => state.clearUser);

  const [open, setOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  const initial = user.name.charAt(0).toUpperCase();

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;

      if (
        target instanceof Node &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open]);

  function handleSettings() {
    setOpen(false);
    router.push("/settings");
  }

  function handleSignout() {
    clearUser();
    setOpen(false);
    signOutAction();
  }

  return (
    <div ref={menuRef} className="relative">
      <IconButton
        label="Open profile menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="
          bg-(--sage-light)
          text-(--sage-dark)
          hover:bg-(--sage)
          hover:text-white
        "
      >
        {initial}
      </IconButton>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{
              opacity: 0,
              y: -6,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -4,
              scale: 0.98,
            }}
            transition={{
              duration: 0.16,
              ease: [0.2, 0.8, 0.2, 1],
            }}
            className="
              absolute
              right-0
              top-12
              z-50
              w-56
              origin-top-right
              rounded-lg
              border
              border-(--line)
              bg-(--surface-1)
              p-2
              shadow-[0_12px_30px_rgba(30,30,30,0.08)]
            "
          >
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-(--ink)">
                {user.name}
              </p>

              <p className="text-xs text-(--subtle)">
                Your account
              </p>
            </div>

            <div className="my-1 h-px bg-(--line)" />

            {/* <button
              type="button"
              onClick={handleSettings}
              className="
                flex
                w-full
                items-center
                gap-2
                rounded-sm
                px-3
                py-2
                text-left
                text-sm
                text-(--ink)
                transition-colors
                hover:bg-(--surface-2)
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-(--sage)
              "
            >
              <Settings size={16} aria-hidden="true" />
              Settings
            </button> */}

            <form action={handleSignout}>
              <Button
                type="submit"
                size="sm"
                className="mt-1 w-full"
              >
                Sign out
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}