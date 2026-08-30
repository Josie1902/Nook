import z from "zod";

export type GoogleAuthState = {
  success: boolean;
  error?: string;
};

export type SignUpState = {
  success: boolean;
  errors?:
    | z.ZodFlattenedError<{
        email: string;
        password: string;
        confirmPassword: string;
        name: string;
      }>
    | string;

  values: {
    name: string;
    email: string;
  }
};

export type SignInState = {
  success: boolean;
  errors?:
    | z.ZodFlattenedError<{
        email: string;
        password: string;
      }>
    | string;
};


export type ForgotPasswordState = {
  success: boolean;
  values: {
    email: string;
  };
  error?: string;
};

export type ResetPasswordState = {
  success: boolean;
  error?: string;
  fieldErrors?: {
    password?: string[];
    confirmPassword?: string[];
  };
};