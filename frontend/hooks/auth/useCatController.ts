"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import type { PixelCatState } from "../../components/features/cat/AuthNook";

export interface CatController {
  state: PixelCatState;

  eyeOffset: {
    x: number;
    y: number;
  };

  /**
   * Updates the cat's resting state based on
   * whether the sign-in fields contain content.
   *
   * Empty fields  -> sleeping
   * Filled fields -> resting
   */
  notifyFieldsFilled: (filled: boolean) => void;

  /**
   * Called when the pointer enters the Library scene.
   */
  enterScene: () => void;

  /**
   * Called when the pointer leaves the Library scene.
   */
  leaveScene: () => void;

  /**
   * Reset the cat back to its initial state.
   */
  reset: () => void;
}

interface UseCatControllerOptions {
  sceneRef: React.RefObject<HTMLElement | null>;
}

export function useCatController({
  sceneRef,
}: UseCatControllerOptions): CatController {
  /*
   * The cat's resting state is determined by whether
   * the sign-in fields currently contain content.
   *
   * This is kept in a ref so pointer/scene interactions
   * can access the latest value without causing effects
   * to re-register.
   */
  const formStateRef = useRef<PixelCatState>(
    "sleeping"
  );

  const [state, setState] =
    useState<PixelCatState>("sleeping");

  /*
   * Pixel-eye movement while the cat is alert.
   */
  const [eyeOffset, setEyeOffset] = useState({
    x: 0,
    y: 0,
  });

  /*
   * True while the pointer is inside the Library scene.
   *
   * While true:
   * - cat stays alert
   * - form state does not override alert
   * - eyes track the pointer
   */
  const sceneInteractionRef = useRef(false);

  /*
   * Update the cat's resting state based on form content.
   *
   * sleeping -> no form content
   * resting  -> form has content
   *
   * If the user is currently interacting with the
   * Library scene, we leave the cat as "alert".
   */
  const notifyFieldsFilled = useCallback(
    (filled: boolean) => {
      const nextState: PixelCatState = filled
        ? "resting"
        : "sleeping";

      formStateRef.current = nextState;

      /*
       * Scene interaction has priority over form state.
       */
      if (sceneInteractionRef.current) {
        return;
      }

      setState(nextState);
    },
    []
  );

  /*
   * Pointer enters the Library scene.
   *
   * The cat becomes alert immediately.
   */
  const enterScene = useCallback(() => {
    sceneInteractionRef.current = true;

    setState("alert");
  }, []);

  /*
   * Pointer leaves the Library scene.
   *
   * Restore whichever resting state the form currently
   * requires.
   */
  const leaveScene = useCallback(() => {
    sceneInteractionRef.current = false;

    setState(formStateRef.current);

    /*
     * Return the eyes to the neutral position.
     */
    setEyeOffset({
      x: 0,
      y: 0,
    });
  }, []);

  /*
   * Track the pointer while the user is interacting
   * with the Library scene.
   */
  useEffect(() => {
    const mouse = sceneRef.current;

    if (!mouse) {
      return;
    }

    const handlePointerMove = (
      event: PointerEvent
    ) => {
      /*
       * Do not track the cursor unless the pointer
       * is currently inside the mouse.
       */
      if (!sceneInteractionRef.current) {
        return;
      }

      const rect =
        mouse.getBoundingClientRect();

      if (!rect.width || !rect.height) {
        return;
      }

      /*
       * Convert pointer position into a normalized
       * 0 -> 1 coordinate inside the scene.
       */
      const normalizedX =
        (event.clientX - rect.left) /
        rect.width;

      const normalizedY =
        (event.clientY - rect.top) /
        rect.height;

      /*
       * Convert normalized position into a small
       * pixel offset for the cat's eyes.
       */
      setEyeOffset({
        x: Math.round(
          (normalizedX - 0.5) * 3
        ),
        y: Math.round(
          (normalizedY - 0.5) * 2
        ),
      });
    };

    mouse.addEventListener(
      "pointermove",
      handlePointerMove
    );

    return () => {
      mouse.removeEventListener(
        "pointermove",
        handlePointerMove
      );
    };
  }, [sceneRef]);

  /*
   * Reset the entire controller.
   */
  const reset = useCallback(() => {
    sceneInteractionRef.current = false;

    formStateRef.current = "sleeping";

    setState("sleeping");

    setEyeOffset({
      x: 0,
      y: 0,
    });
  }, []);

  return {
    state,
    eyeOffset,

    notifyFieldsFilled,

    enterScene,
    leaveScene,

    reset,
  };
}
