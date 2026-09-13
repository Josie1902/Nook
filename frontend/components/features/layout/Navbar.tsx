"use client";

import { motion } from "motion/react";

import { ProfileMenu } from "./ProfileMenu";


export function Navbar() {
  return (
    <header className="border-b border-(--line)">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            ease: [0.2, 0.8, 0.2, 1],
          }}
        >
          <span className="text-lg font-medium tracking-[-0.02em] text-(--ink)">
            Nook
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: 0.05,
            ease: [0.2, 0.8, 0.2, 1],
          }}
        >
          <ProfileMenu />
        </motion.div>
      </div>
    </header>
  );
}