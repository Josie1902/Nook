import { SigninForm } from "./SigninForm";

export function SigninPanel() {
  return (
    <section
      className="
        w-full
        max-w-110
        border
        border-[#e2dfd9]
        bg-[#faf9f6]
        px-7
        py-9
        shadow-[0_12px_40px_rgba(0,0,0,0.04)]
        sm:px-10
        sm:py-11
      "
    >
      {/* Header */}
      <div className="mb-8">
        <h1
          className="
           text-[24px]
            font-semibold
            tracking-[-0.3px]
            text-[#1e1e1e]
          "
        >
          Welcome back.
        </h1>

        <p
          className="
            mt-3
            text-[13px]
            leading-6
            text-[#6b6b6b]
          "
        >
          Sign in to continue reading from your
          personal library.
        </p>
      </div>

      <SigninForm/>
    </section>
  );
}