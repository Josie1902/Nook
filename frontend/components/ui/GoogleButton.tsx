"use client"
import { useFormStatus } from "react-dom";

export function GoogleButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="
        flex
        h-12
        w-full
        items-center
        justify-center
        gap-3
        border
        border-[#d8d5d0]
        bg-white
        px-4
        text-[12px]
        font-semibold
        uppercase
        tracking-[1px]
        text-[#333]
        transition
        hover:bg-[#f8f7f4]
        focus:outline-none
        focus:ring-2
        focus:ring-[#789b74]/40
        focus:ring-offset-2
        disabled:cursor-not-allowed
        disabled:opacity-60
      "
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          fill="#4285F4"
          d="M21.35 12.27c0-.71-.06-1.39-.18-2.05H12v3.88h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.7 2.91-4.2 2.91-7.22Z"
        />
        <path
          fill="#34A853"
          d="M12 21.75c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.93-3.31.93-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.75 9.75 0 0 0 12 21.75Z"
        />
        <path
          fill="#FBBC05"
          d="M6.54 13.84A5.86 5.86 0 0 1 6.23 12c0-.64.11-1.26.31-1.84V7.63H3.3A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.05 4.37l3.24-2.53Z"
        />
        <path
          fill="#EA4335"
          d="M12 6.13c1.43 0 2.72.49 3.73 1.45l2.8-2.8C16.84 3.21 14.63 2.25 12 2.25a9.75 9.75 0 0 0-8.7 5.38l3.24 2.53C7.31 7.85 9.46 6.13 12 6.13Z"
        />
      </svg>

      {pending ? "Connecting..." : "Continue with Google"}
    </button>
  );
}