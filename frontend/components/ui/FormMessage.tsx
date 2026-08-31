import {
  cva,
  type VariantProps,
} from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils/cn";

const formMessageVariants = cva(
  `
    w-full
    border
    px-3
    py-2.5
    text-[12px]
    leading-5
  `,
  {
    variants: {
      variant: {
        /*
         * Standard validation error
         *
         * Used for:
         * - Invalid form submission
         * - Authentication errors
         * - General validation errors
         */
        default: `
          border-[#e0b4b4]
          bg-[#fbf0f0]
          text-[#8b4545]
        `,

        /*
         * Strong destructive message
         *
         * Used for:
         * - Dangerous actions
         * - Account deletion
         * - Critical failures
         */
        destructive: `
          border-[#c98b8b]
          bg-[#f7e5e5]
          text-[#763939]
        `,

        /*
         * Warning message
         *
         * Used for:
         * - Password requirements
         * - Expiring sessions
         * - Non-blocking validation
         */
        warning: `
          border-[#d8c89b]
          bg-[#faf6e8]
          text-[#76652f]
        `,

        /*
         * Informational message
         *
         * Used for:
         * - Helpful form information
         * - Account verification notices
         */
        info: `
          border-[#b9c9d4]
          bg-[#f1f6f9]
          text-[#4d6878]
        `,

        /*
         * Success message
         *
         * Used for:
         * - Successful actions
         * - Confirmation messages
         */
        success: `
          border-[#b8c8b5]
          bg-[#f1f6f0]
          text-[#486047]
        `,
      },

      size: {
        default: `
          px-3
          py-2.5
          text-[12px]
          leading-5
        `,

        sm: `
          px-2.5
          py-2
          text-[11px]
          leading-4
        `,

        lg: `
          px-4
          py-3
          text-[13px]
          leading-5
        `,
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

interface FormMessageProps
  extends
    React.ComponentProps<"div">,
    VariantProps<typeof formMessageVariants> {
  message?: string | string[];
}

function FormMessage({
  className,
  variant,
  size,
  message,
  children,
  ...props
}: FormMessageProps) {
  if (!message && !children) {
    return null;
  }

  const messages = message
    ? Array.isArray(message)
      ? message
      : [message]
    : [];

  return (
    <div
      data-slot="form-message"
      role="alert"
      className={cn(
        formMessageVariants({
          variant,
          size,
        }),
        className,
      )}
      {...props}
    >
      {messages.length > 0
        ? messages.map((error, index) => (
            <p key={`${error}-${index}`}>
              {error}
            </p>
          ))
        : children}
    </div>
  );
}

export {
  FormMessage,
  formMessageVariants,
};