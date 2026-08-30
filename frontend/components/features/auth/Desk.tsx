export function Desk() {
  return (
    <div
      className="
        relative
        mt-6
        h-29.5
        shrink-0
      "
      aria-hidden="true"
    >
      {/* Desk top */}
      <div
        className="
          absolute
          inset-x-0
          top-0
          h-5
          border-2
          border-[#1e1e1e]
          bg-[#987257]
        "
      />

      {/* Left leg */}
      <div
        className="
          absolute
          bottom-0
          left-1.5
          top-4.5
          w-3.5
          border-2
          border-t-0
          border-[#1e1e1e]
          bg-[#7a5a41]
        "
      />

      {/* Right leg */}
      <div
        className="
          absolute
          bottom-0
          right-1.5
          top-4.5
          w-3.5
          border-2
          border-t-0
          border-[#1e1e1e]
          bg-[#7a5a41]
        "
      />

      {/* Drawer */}
      <div
        className="
          absolute
          left-8
          top-5
          flex
          h-15.5
          w-15.5
          flex-col
          items-center
          justify-evenly
          border-2
          border-t-0
          border-[#1e1e1e]
          bg-[#987257]
        "
      >
        <span className="h-0.75 w-4.5 bg-[#1e1e1e]" />
        <span className="h-0.75 w-4.5 bg-[#1e1e1e]" />
      </div>

      {/* Cushion */}
      <div
        className="
          absolute
          bottom-1.5
          right-[18%]
          h-8.5
          w-27.5
          rounded-[50%_60%_55%_45%/70%_65%_60%_75%]
          border-2
          border-[#7a1f1f]
          bg-[#d16a6a]
          opacity-[0.92]
        "
      />
    </div>
  );
}