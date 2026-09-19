import { redirect } from "next/navigation";

export function AskNookCard() {
  return (
    <button
      onClick={() => redirect("/ask-nook")}
      className="
        group
        relative
        flex
        h-full
        w-full
        flex-col
        overflow-hidden
        rounded-3xl
        bg-(--canvas-2)
        text-left
        transition-transform
        duration-300
        hover:-translate-y-1
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-(--sage)
      "
    >
      {/* Conversation visual */}
      <div
        className="
          relative
          flex
          flex-1
          items-center
          justify-center
          px-6
        "
      >
        <div
          className="
            relative
            rounded-2xl
            bg-(--sage-light)
            px-8
            py-5
            text-center
            shadow-sm
            transition-transform
            duration-300
            group-hover:-translate-y-2
          "
        >
          <p
            className="
              text-lg
              font-medium
              text-(--ink)
            "
          >
            Have a question?
          </p>

          {/* Speech bubble tail */}
          <div
            className="
              absolute
              -bottom-3
              left-8
              h-6
              w-6
              rotate-45
              bg-(--sage-light)
            "
          />
        </div>

        {/* Small typing dots */}
        <div
          className="
            absolute
            bottom-1/3
            right-1/4
            flex
            gap-1
            opacity-60
          "
        >
          <span
            className="
              h-1.5
              w-1.5
              rounded-full
              bg-(--sage-dark)
            "
          />
          <span
            className="
              h-1.5
              w-1.5
              rounded-full
              bg-(--sage-dark)
            "
          />
          <span
            className="
              h-1.5
              w-1.5
              rounded-full
              bg-(--sage-dark)
            "
          />
        </div>
      </div>

      {/* Text */}
      <div
        className="
          px-6
          pb-6
        "
      >
        <h2
          className="
            text-xl
            font-semibold
            text-(--ink)
          "
        >
          Ask Nook

          <span
            className="
              ml-2
              inline-block
              text-(--sage-dark)
              transition-transform
              duration-300
              group-hover:translate-x-1
            "
          >
            →
          </span>
        </h2>

        <p
          className="
            mt-1
            text-sm
            text-(--muted)
          "
        >
          Explore your library
        </p>
      </div>
    </button>
  );
}