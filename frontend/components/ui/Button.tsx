import { Slot } from "radix-ui";
import {
  cva,
  type VariantProps,
} from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  `
    inline-flex
    items-center
    justify-center
    gap-2
    whitespace-nowrap
    outline-none
    transition-all
    disabled:pointer-events-none
    disabled:cursor-not-allowed
    disabled:opacity-60
    focus-visible:ring-2
    focus-visible:ring-[#789b74]/40
    focus-visible:ring-offset-2
    [&_svg]:pointer-events-none
    [&_svg]:shrink-0
  `,
  {
    variants: {
      variant: {
        /*
         * Primary Nook action
         *
         * Used for:
         * - Sign in
         * - Create account
         * - Other primary actions
         */
        default: `
          h-12
          w-full
          bg-[#486047]
          px-4
          text-[12px]
          font-semibold
          uppercase
          tracking-[1.2px]
          text-white
          hover:bg-[#3d533d]
          focus-visible:ring-[#789b74]
        `,

        /*
         * Destructive action
         */
        destructive: `
          h-12
          w-full
          bg-[#8b4545]
          px-4
          text-[12px]
          font-semibold
          uppercase
          tracking-[1.2px]
          text-white
          hover:bg-[#763939]
          focus-visible:ring-[#b87979]
        `,

        /*
         * Secondary / outlined action
         *
         * Used by:
         * - Continue with Google
         * - Secondary actions
         */
        outline: `
          h-12
          w-full
          border
          border-[#d8d5d0]
          bg-white
          px-4
          text-[12px]
          font-semibold
          uppercase
          tracking-[1px]
          text-[#333]
          hover:bg-[#f8f7f4]
          focus-visible:border-[#789b74]
        `,

        /*
         * Muted secondary action
         */
        secondary: `
          h-12
          bg-[#e9e6e0]
          px-4
          text-[12px]
          font-semibold
          uppercase
          tracking-[1px]
          text-[#486047]
          hover:bg-[#dedbd5]
        `,

        /*
         * Minimal action
         */
        ghost: `
          h-10
          px-3
          text-[11px]
          font-semibold
          uppercase
          tracking-[1px]
          text-[#5f765c]
          hover:bg-[#f0eee9]
          hover:text-[#486047]
        `,

        /*
         * Text/link action
         */
        link: `
          h-auto
          p-0
          text-[11px]
          font-semibold
          text-[#5f765c]
          underline-offset-4
          hover:underline
        `,
      },

      size: {
        /*
         * Default form button
         */
        default: `
          h-12
          px-4
        `,

        /*
         * Smaller button
         */
        sm: `
          h-9
          px-3
          text-[11px]
        `,

        /*
         * Larger button
         */
        lg: `
          h-13
          px-6
        `,

        /*
         * Icon-only button
         */
        icon: `
          size-10
          px-0
        `,
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild
    ? Slot.Root
    : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(
        buttonVariants({
          variant,
          size,
          className,
        }),
      )}
      {...props}
    />
  );
}

export {
  Button,
  buttonVariants,
};
