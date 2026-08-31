import * as React from "react";

import { cn } from "@/lib/utils/cn";

function Input({
  className,
  type,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        `
          h-12
          w-full
          min-w-0
          border
          border-[#d8d5d0]
          bg-white
          px-3.5
          text-[14px]
          text-[#1e1e1e]
          outline-none
          transition
          placeholder:text-[#a0a0a0]
          selection:bg-[#486047]
          selection:text-white

          file:inline-flex
          file:h-7
          file:border-0
          file:bg-transparent
          file:text-sm
          file:font-medium

          disabled:pointer-events-none
          disabled:cursor-not-allowed
          disabled:opacity-60

          focus:border-[#789b74]
          focus:ring-2
          focus:ring-[#789b74]/15

          aria-invalid:border-[#b87979]
          aria-invalid:ring-2
          aria-invalid:ring-[#b87979]/15
        `,
        className,
      )}
      {...props}
    />
  );
}

export { Input };
