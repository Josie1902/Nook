"use client";

import {
  ChangeEvent,
  useActionState,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";

import {
  googleAuthAction,
  signInAction,
} from "@/lib/actions/auth";

import {
  GoogleAuthState,
  SignInState,
} from "@/types/auth";

import { Input } from "@/components/ui/Input";
import { GoogleButton } from "@/components/ui/GoogleButton";
import { FormMessage } from "@/components/ui/FormMessage";

import { useAuth } from "../AuthContext";
import { Button } from "@/components/ui/Button";

const initialState: SignInState = {
  success: false,
};

const initialGoogleState: GoogleAuthState = {
  success: false,
};

function SignInButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
    >
      {pending ? "Opening library..." : "Sign in"}
    </Button>
  );
}


export function SigninForm() {
  const [state, formAction] = useActionState(
    signInAction,
    initialState
  );

  const [googleState, googleFormAction] =
    useActionState(
      googleAuthAction,
      initialGoogleState
    );

  const { notifyFieldsFilled } = useAuth();

  /* ------------------------------------------------------------------------ */
  /* Form state                                                               */
  /* ------------------------------------------------------------------------ */

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  /* ------------------------------------------------------------------------ */
  /* Reset password after unsuccessful submission                             */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (state.success === false && state.errors) {
      setPassword("");
    }
  }, [state]);

  /* ------------------------------------------------------------------------ */
  /* Errors                                                                   */
  /* ------------------------------------------------------------------------ */

  const fieldErrors =
    state.errors &&
    typeof state.errors !== "string"
      ? state.errors.fieldErrors
      : {};

  const formErrors =
    state.errors &&
    typeof state.errors !== "string"
      ? state.errors.formErrors
      : [];

  const serverError =
    typeof state.errors === "string"
      ? state.errors
      : undefined;

  /* ------------------------------------------------------------------------ */
  /* Handlers                                                                 */
  /* ------------------------------------------------------------------------ */

  function handleEmailChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const value = event.target.value;

    setEmail(value);

    notifyFieldsFilled(
      value.trim().length > 0 ||
        password.length > 0
    );
  }

  function handlePasswordChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const value = event.target.value;

    setPassword(value);

    notifyFieldsFilled(
      email.trim().length > 0 ||
        value.length > 0
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="w-full">
      {/* Google */}
      <form action={googleFormAction}>
        <GoogleButton />
      </form>

      {/* Google error */}
      {googleState.error && (
        <p
          role="alert"
          className="
            mt-3
            border
            border-[#e0b4b4]
            bg-[#fbf0f0]
            px-3
            py-2.5
            text-[12px]
            font-normal
            leading-[1.65]
            text-[#8b4545]
          "
        >
          {googleState.error}
        </p>
      )}

      {/* Divider */}
      <div
        className="
          my-7
          flex
          items-center
          gap-3
        "
      >
        <div className="h-px flex-1 bg-[#dedbd5]" />

        <span
          className="
            text-[9px]
            font-semibold
            uppercase
            tracking-[1.2px]
            text-[#999]
          "
        >
          Or
        </span>

        <div className="h-px flex-1 bg-[#dedbd5]" />
      </div>

      {/* Sign-in form */}
      <form
        action={formAction}
        className="flex flex-col gap-5"
      >
        {/* Form errors */}
        {formErrors.length > 0 && (
          <FormMessage message={formErrors} />
        )}

        {/* Server error */}
        {serverError && (
          <FormMessage message={serverError} />
        )}

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="
              mb-2
              block
              text-[11px]
              font-semibold
              uppercase
              tracking-[1.1px]
              text-[#555]
            "
          >
            Email
          </label>

          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="you@example.com"
            required
          />

          {fieldErrors.email?.[0] && (
            <p
              role="alert"
              className="
                mt-2
                text-[12px]
                font-normal
                leading-[1.65]
                text-[#8b4545]
              "
            >
              {fieldErrors.email[0]}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <div
            className="
              mb-2
              flex
              items-center
              justify-between
            "
          >
            <label
              htmlFor="password"
              className="
                text-[11px]
                font-semibold
                uppercase
                tracking-[1.1px]
                text-[#555]
              "
            >
              Password
            </label>

            {/* Secondary Action */}
            <Link
              href="/forgot-password"
              className="
                text-[11px]
                font-medium
                leading-normal
                text-[#5f765c]
                underline-offset-4
                hover:underline
              "
            >
              Forgot password?
            </Link>
          </div>

          <div className="relative">
            <Input
              id="password"
              name="password"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              autoComplete="current-password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Your password"
              required
              className="pr-20"
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  (current) => !current
                )
              }
              className="
                absolute
                right-3
                top-1/2
                -translate-y-1/2
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.8px]
                text-[#777]
                hover:text-[#1e1e1e]
              "
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {fieldErrors.password?.[0] && (
            <p
              role="alert"
              className="
                mt-2
                text-[12px]
                font-normal
                leading-[1.65]
                text-[#8b4545]
              "
            >
              {fieldErrors.password[0]}
            </p>
          )}
        </div>

        {/* Submit */}
        <SignInButton />

        {/* Register */}
        <p
          className="
            pt-1
            text-center
            text-[13px]
            font-normal
            leading-[1.85]
            text-[#777]
          "
        >
          New to the library?{" "}
          <Link
            href="/signup"
            className="
              font-medium
              text-[#486047]
              underline-offset-4
              hover:underline
            "
          >
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}
