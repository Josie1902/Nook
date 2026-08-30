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
  signUpAction,
} from "@/lib/actions/auth";

import {
  GoogleAuthState,
  SignUpState,
} from "@/types/auth";

import { Input } from "@/components/ui/Input";
import { GoogleButton } from "@/components/ui/GoogleButton";
import { FormMessage } from "@/components/ui/FormMessage";

import { useAuth } from "../AuthContext";
import { Button } from "@/components/ui/Button";

const initialState: SignUpState = {
  success: false,
  values: {
    name: "",
    email: "",
  },
};

const initialGoogleState: GoogleAuthState = {
  success: false,
};


function SignUpButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
    >
      {pending ? "Opening library..." : "Create account"}
    </Button>
  );
}

export function SignupForm() {
  const [state, formAction] = useActionState(
    signUpAction,
    initialState
  );

  const [googleState, googleFormAction] =
    useActionState(
      googleAuthAction,
      initialGoogleState
    );

  // Hook: Avoid prop drilling from SignupView
  // --> SignupPanel --> SignupForm
  const { notifyFieldsFilled } = useAuth();

  // Controlled form fields
  const [name, setName] = useState(
    initialState.values.name
  );

  const [email, setEmail] = useState(
    initialState.values.email
  );

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  // Password visibility
  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  /**
   * Keep name/email after server-side validation errors.
   *
   * Passwords are deliberately not returned by the
   * server and therefore remain controlled locally.
   */
  useEffect(() => {
    if (state.values) {
      setName(state.values.name ?? "");
      setEmail(state.values.email ?? "");
    }

    if (state.success === false && state.errors) {
      setPassword("");
      setConfirmPassword("");
    }
  }, [state]);

  // UI: Field/form errors
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

  /**
   * Notify AuthContext whenever the user has started
   * filling in the form.
   */
  function notifyFormFields(
    nextName: string,
    nextEmail: string,
    nextPassword: string,
    nextConfirmPassword: string
  ) {
    notifyFieldsFilled(
      nextName.trim().length > 0 ||
        nextEmail.trim().length > 0 ||
        nextPassword.length > 0 ||
        nextConfirmPassword.length > 0
    );
  }

  function handleNameChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const value = event.target.value;

    setName(value);

    notifyFormFields(
      value,
      email,
      password,
      confirmPassword
    );
  }

  function handleEmailChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const value = event.target.value;

    setEmail(value);

    notifyFormFields(
      name,
      value,
      password,
      confirmPassword
    );
  }

  function handlePasswordChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const value = event.target.value;

    setPassword(value);

    notifyFormFields(
      name,
      email,
      value,
      confirmPassword
    );
  }

  function handleConfirmPasswordChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const value = event.target.value;

    setConfirmPassword(value);

    notifyFormFields(
      name,
      email,
      password,
      value
    );
  }

  return (
    <div className="flex flex-col">

      {/* Google */}
      <form action={googleFormAction}>
        <GoogleButton />
      </form>

      {/* Google error */}
      {googleState.error && (
        <FormMessage message={googleState.error} />
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

      {/* Sign-up form */}
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

        {/* Name */}
        <div>
          <label
            htmlFor="name"
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
            Name
          </label>

          <Input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={handleNameChange}
            placeholder="Your name"
            required
          />

          {fieldErrors.name?.[0] && (
            <p
              role="alert"
              className="
                mt-2
                text-[12px]
                leading-5
                text-[#8b4545]
              "
            >
              {fieldErrors.name[0]}
            </p>
          )}
        </div>

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
                leading-5
                text-[#8b4545]
              "
            >
              {fieldErrors.email[0]}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
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
            Password
          </label>

          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Create a password"
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
                leading-[1.4]
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
                leading-5
                text-[#8b4545]
              "
            >
              {fieldErrors.password[0]}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirmPassword"
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
            Confirm Password
          </label>

          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={
                showConfirmPassword
                  ? "text"
                  : "password"
              }
              autoComplete="new-password"
              value={confirmPassword}
              onChange={
                handleConfirmPasswordChange
              }
              placeholder="Confirm your password"
              required
              className="pr-20"
            />

            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(
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
                leading-[1.4]
              "
              aria-label={
                showConfirmPassword
                  ? "Hide password"
                  : "Show password"
              }
            >
              {showConfirmPassword
                ? "Hide"
                : "Show"}
            </button>
          </div>

          {fieldErrors.confirmPassword?.[0] && (
            <p
              role="alert"
              className="
                mt-2
                text-[12px]
                leading-5
                text-[#8b4545]
              "
            >
              {fieldErrors.confirmPassword[0]}
            </p>
          )}
        </div>

        {/* Submit */}
        <SignUpButton />

        {/* Sign in */}
        <p
          className="
            pt-1
            text-center
            text-[13px]
            text-[#777]
          "
        >
          Already have an account?{" "}
          <Link
            href="/"
            className="
              font-medium
              text-[#486047]
              underline-offset-4
              hover:underline
            "
          >
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
