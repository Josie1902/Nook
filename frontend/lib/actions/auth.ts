"use server"

import { auth } from "@/lib/auth/init"
import { signUpSchema, signInSchema, forgotPasswordSchema, resetPasswordSchema } from "@/lib/validations/auth"
import { ForgotPasswordState, GoogleAuthState, ResetPasswordState, SignInState, SignUpState } from "@/types/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import z from "zod"


export async function signUpAction(
  _previousState: SignUpState,
  formData: FormData
): Promise<SignUpState> {
    const result = signUpSchema.safeParse({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
      name: formData.get("name") as string
    }); 

    if (!result.success) {
      return {
        success: false,
        errors: z.flattenError(result.error),
        values: {
            name: formData.get("name") as string,
            email: formData.get("email") as string,
        }
      };
    }   

    const { email, password, name } = result.data;  

    try {
        await auth.api.signUpEmail({
          body: {
            email,
            password,
            name,
          },
        });
    } catch (err) {
        console.error("Error during sign up:", err)
        return {
          success: false,
          errors: "An error occurred during sign up. Please try again.",
          values: {
            name: formData.get("name") as string,
            email: formData.get("email") as string,
         }
        };
    }

    redirect("/");
}

export async function signInAction(
  _previousState: SignInState,
  formData: FormData
): Promise<SignInState> {
  const result = signInSchema.safeParse({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (!result.success) {
    return {
      success: false,
      errors: z.flattenError(result.error),
    };
  }


  const { email, password } = result.data;

  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });
  } catch (error) {
    return {
      success: false,
      errors: "Invalid email or password.",
    };
  }

  redirect("/");
}

export async function googleAuthAction(
  _previousState: GoogleAuthState,
  _formData: FormData
): Promise<GoogleAuthState> {
  let url: string | undefined;

  try {
    const response = await auth.api.signInSocial({
      body: {
        provider: "google",
        callbackURL: "/",
      },
      headers: await headers(),
    });

    url = response.url;
  } catch {
    return {
      success: false,
      error: "Unable to sign in with Google. Please try again.",
    };
  }

  if (!url) {
    return {
      success: false,
      error: "Unable to sign in with Google. Please try again.",
    };
  }

  redirect(url);
}

export async function signOutAction() {
    await auth.api.signOut({
        headers: await headers()
    })

    redirect("/")
}

export async function requestPasswordResetAction(
  _previousState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const values = {
    email: formData.get("email") as string,
  };

  const result = forgotPasswordSchema.safeParse(values);

  if (!result.success) {
    return {
      success: false,
      values,
      error: result.error.issues[0]?.message ?? "Invalid email address.",
    };
  }

  try {
    await auth.api.requestPasswordReset({
      body: {
        email: values.email,
        redirectTo: "/reset-password",
      },
    });

    return {
      success: true,
      values,
    };
  } catch (error) {
    console.error("Password reset request failed:", error);

    return {
      success: false,
      values,
      error: "Unable to send password reset email. Please try again.",
    };
  }
}

export async function resetPasswordAction(
  _previousState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const values = {
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(
      formData.get("confirmPassword") ?? ""
    ),
    token: String(formData.get("token") ?? ""),
  };

  const result = resetPasswordSchema.safeParse(values);

  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;

    return {
      success: false,
      fieldErrors,
    };
  }

  try {
    const response = await auth.api.resetPassword({
      body: {
        newPassword: values.password,
        token: values.token,
      },
    });

    if (!response) {
      return {
        success: false,
        error: "Unable to reset your password.",
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Password reset failed:", error);

    return {
      success: false,
      error: "This password reset link is invalid or has expired.",
    };
  }
}