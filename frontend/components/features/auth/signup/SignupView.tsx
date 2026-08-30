"use client";

import { AuthLayout } from "@/components/features/auth/AuthLayout";
import { SignupPanel } from "./SignupPanel";

export default function SignupView() {
  return (
    <AuthLayout>
      <SignupPanel/>
    </AuthLayout>
  );
}