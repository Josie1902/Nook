import type { ButtonHTMLAttributes, ReactNode } from "react";

interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  children: ReactNode;
}

export function IconButton({
  label,
  children,
  className = "",
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`
        flex
        h-9
        w-9
        items-center
        justify-center
        rounded-full
        transition-colors
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-(--sage)
        focus-visible:ring-offset-2
        focus-visible:ring-offset-(--canvas)
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}