import { SignupForm } from "./SignupForm";

export function SignupPanel() {
  return (
    <section
      className="
        w-full
        max-w-110
      "
    >
      {/* Header */}
      <div className="mb-7">
        <h1
          className="
            text-[24px]
            font-semibold
            tracking-[-0.3px]
            text-[#1e1e1e]
          "
        >
          Begin Your Nook Journey
        </h1>
      </div>

      <SignupForm />
    </section>
  );
}
