"use client";

import { useActionState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

import { resetPasswordAction } from "@/lib/actions/auth";
import { ResetPasswordState } from "@/types/auth";

const initialState: ResetPasswordState = {
  success: false,
};

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token");
  const errorParam = searchParams.get("error");

  const [state, formAction, pending] = useActionState(
    resetPasswordAction,
    initialState
  );

  const fieldErrors = state.fieldErrors ?? {};

  useEffect(() => {
    if (state.success) {
      router.push("/signin?reset=success");
    }
  }, [state.success, router]);


   // Better Auth may redirect here with an error
   // when the reset token is invalid or expired.
   
  if (errorParam === "INVALID_TOKEN" || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold">
              Invalid reset link
            </h1>

            <p className="text-sm text-muted-foreground">
              This password reset link is invalid or has
              expired.
            </p>
          </div>

          <div className="text-center">
            <Link
              href="/forgot-password"
              className="text-sm font-medium underline underline-offset-4"
            >
              Request a new reset link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">

        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">
            Reset your password
          </h1>

          <p className="text-sm text-muted-foreground">
            Enter your new password below.
          </p>
        </div>

        <form
          action={formAction}
          className="flex flex-col gap-4"
        >
          {/* General error */}
          {state.error && (
            <p className="text-sm text-destructive">
              {state.error}
            </p>
          )}

          {/* New password */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-sm font-medium"
            >
              New password
            </label>

            <Input
              id="password"
              type="password"
              name="password"
              placeholder="New password"
              required
            />

            {fieldErrors.password?.[0] && (
              <p className="text-sm text-destructive">
                {fieldErrors.password[0]}
              </p>
            )}
          </div>

          {/* Confirm password */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="confirm-password"
              className="text-sm font-medium"
            >
              Confirm new password
            </label>

            <Input
              id="confirm-password"
              type="password"
              name="confirmPassword"
              placeholder="Confirm new password"
              required
            />

            {fieldErrors.confirmPassword?.[0] && (
              <p className="text-sm text-destructive">
                {fieldErrors.confirmPassword[0]}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={pending}
          >
            {pending
              ? "Resetting..."
              : "Reset Password"}
          </Button>
        </form>

        <div className="text-center">
          <Link
            href="/signin"
            className="text-sm text-muted-foreground underline underline-offset-4"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}