"use client";

import type { Character } from "@/lib/types";

const SIZES = {
  xs: "h-8 w-8 text-base",
  sm: "h-10 w-10 text-lg",
  md: "h-14 w-14 text-2xl",
  lg: "h-20 w-20 text-3xl",
  xl: "h-28 w-28 text-5xl",
} as const;

export default function Avatar({
  character,
  size = "md",
  ring = false,
  online = false,
  className = "",
}: {
  character: Character;
  size?: keyof typeof SIZES;
  ring?: boolean;
  online?: boolean;
  className?: string;
}) {
  const [from, to] = character.accent;
  return (
    <div className={`relative shrink-0 ${className}`}>
      <div
        className={`${SIZES[size]} rounded-full grid place-items-center font-bold select-none overflow-hidden ${
          ring ? "ring-2 ring-white/15" : ""
        }`}
        style={{
          background: `linear-gradient(135deg, ${from}, ${to})`,
          boxShadow: `0 6px 20px -8px ${from}99`,
        }}
        aria-hidden
      >
        {character.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={character.avatar}
            alt={character.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="drop-shadow-sm">{character.emoji ?? "✨"}</span>
        )}
      </div>
      {online && (
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 border-2 border-ink-900" />
      )}
    </div>
  );
}
