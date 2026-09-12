"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

import { useUserStore } from "@/stores/user-store";

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 18) {
    return "Good afternoon";
  }

  return "Good evening";
}

export function WelcomeHeader() {
  const user = useUserStore((state) => state.user);
  const [greeting, setGreeting] = useState("Good evening");

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  return (
    <motion.section
      aria-labelledby="welcome-heading"
      initial={{
        opacity: 0,
        y: 16,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.45,
        ease: [0.2, 0.8, 0.2, 1],
      }}
      className="space-y-3"
    >
      <p
        className="
          text-sm
          font-medium
          tracking-[0.01em]
          text-(--muted)
        "
      >
        {greeting}
      </p>

      <h1
        id="welcome-heading"
        className="
          max-w-2xl
          text-3xl
          font-medium
          leading-[1.1]
          tracking-[-0.035em]
          text-(--ink)
          sm:text-5xl
        "
      >
        Welcome back, {user.name}
      </h1>

      <p
        className="
          max-w-xl
          pt-1
          text-base
          leading-7
          text-(--muted)
        "
      >
        Your little corner of the library is waiting for you.
      </p>
    </motion.section>
  );
}