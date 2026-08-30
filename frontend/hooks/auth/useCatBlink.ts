"use client";

import { useEffect, useRef, useState } from "react";

export function useCatBlink(enabled: boolean) {
  const [blinking, setBlinking] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) {
      setBlinking(false);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      return;
    }

    const scheduleBlink = () => {
      // Wait 3–9 seconds before the next blink
      const delay = 3000 + Math.random() * 6000;

      timeoutRef.current = setTimeout(() => {
        // Close eyes
        setBlinking(true);

        // Keep eyes closed for only 100ms
        timeoutRef.current = setTimeout(() => {
          setBlinking(false);

          // Schedule another blink
          scheduleBlink();
        }, 100);
      }, delay);
    };

    scheduleBlink();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [enabled]);

  return blinking;
}