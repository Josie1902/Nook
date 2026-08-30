"use client";

import { AuthLayout } from "@/components/features/auth/AuthLayout";
import { SigninPanel } from "@/components/features/auth/siginin/SigninPanel";

export default function SigninView() {
  return (
    <AuthLayout>
      <SigninPanel/>
    </AuthLayout>
  );
}