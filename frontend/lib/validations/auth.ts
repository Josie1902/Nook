import { z } from "zod"

// Doc: https://zod.dev/

export const signUpSchema = z
  .object({
    email: z
      .email("Please enter a valid email address"),

    password: z
      .string()
      .min(16, "Password must be at least 16 characters")
      .regex(/[a-z]/, "Password must contain a lowercase letter")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[0-9]/, "Password must contain a number")
      .regex(/[^A-Za-z0-9]/, "Password must contain a special character")
      .max(128, "Password must be less than 128 characters"),

    confirmPassword: z
      .string()
      .min(1, "Please confirm your password"),

    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .max(100, "Name must be less than 100 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export const signInSchema = z.object({
    email: z
    .email("Please enter a valid email address"),

  password: z
    .string()
    .min(1, "Password is required"),
})


export const forgotPasswordSchema = z.object({
  email: z.email("Please enter a valid email address."),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(16, "Password must be at least 16 characters")
      .regex(/[a-z]/, "Password must contain a lowercase letter")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[0-9]/, "Password must contain a number")
      .regex(/[^A-Za-z0-9]/, "Password must contain a special character")
      .max(128, "Password must be less than 128 characters"),
    confirmPassword: z.string(),
    token: z.string().min(1, "Invalid reset token."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });