"use client";

import { useActionState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

import {
  requestPasswordResetAction,
} from "@/lib/actions/auth";

import { ForgotPasswordState } from "@/types/auth";

const initialState: ForgotPasswordState = {
  success: false,
  values: {
    email: "",
  },
};

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(
    requestPasswordResetAction,
    initialState
  );

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">

        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">
            Forgot your password?
          </h1>

          <p className="text-sm text-muted-foreground">
            Enter your email and we'll send you a link
            to reset your password.
          </p>
        </div>

        {state.success ? (
          <div className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              If an account exists for that email, you'll
              receive a password reset link shortly.
            </p>

            <Link
              href="/signin"
              className="text-sm font-medium underline underline-offset-4"
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form
            action={formAction}
            className="flex flex-col gap-4"
          >
            {state.error && (
              <p className="text-sm text-destructive">
                {state.error}
              </p>
            )}

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-sm font-medium"
              >
                Email
              </label>

              <Input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                defaultValue={state.values.email}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={pending}
            >
              {pending
                ? "Sending..."
                : "Send Reset Link"}
            </Button>
          </form>
        )}

        {!state.success && (
          <div className="text-center">
            <Link
              href="/signin"
              className="text-sm text-muted-foreground underline underline-offset-4"
            >
              Back to Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}