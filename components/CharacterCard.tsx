"use client";

import Link from "next/link";
import { MessageCircle, Flame } from "lucide-react";
import Avatar from "./Avatar";
import type { Character } from "@/lib/types";

export default function CharacterCard({
  character,
  index = 0,
}: {
  character: Character;
  index?: number;
}) {
  const [from, to] = character.accent;
  return (
    <Link
      href={`/chat/${character.id}`}
      style={{ animationDelay: `${Math.min(index * 45, 400)}ms` }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-ink-850/80 opacity-0 animate-fade-up transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl"
    >
      <div
        className="relative h-36 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
      >
        {character.cover ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={character.cover}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 opacity-40 mix-blend-overlay mesh" />
            <div className="absolute -right-6 -bottom-8 text-[9rem] leading-none opacity-30 blur-[1px] select-none">
              {character.emoji}
            </div>
          </>
        )}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/35 px-2 py-1 text-[11px] font-medium text-white/90 backdrop-blur">
          <span>{character.flag}</span>
          <span>{character.country}</span>
        </div>
        {character.official && (
          <div className="absolute top-3 right-3 rounded-full bg-black/35 px-2 py-1 text-[10px] font-semibold tracking-wide text-white/90 backdrop-blur">
            OFICIAL
          </div>
        )}
        <div className="absolute bottom-3 left-3 translate-y-1 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <div className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-ink-950">
            <MessageCircle className="h-3.5 w-3.5" />
            Chatear
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-base font-semibold text-white">{character.name}</h3>
          <div className="flex shrink-0 items-center gap-1 text-[11px] text-white/45">
            <Flame className="h-3 w-3 text-hot-400" />
            {character.chats ?? "nuevo"}
          </div>
        </div>
        <p className="line-clamp-2 text-[13px] leading-snug text-white/55">
          {character.tagline}
        </p>
        <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
          {character.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10.5px] text-white/60"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
