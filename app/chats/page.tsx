"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MessageSquare, Search, Trash2, Compass } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Avatar from "@/components/Avatar";
import {
  findCharacter,
  loadChats,
  loadCustomCharacters,
  relativeTime,
  saveChats,
} from "@/lib/store";
import type { Chat, Character } from "@/lib/types";

export default function ChatsPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [custom, setCustom] = useState<Character[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    const sync = () => {
      setChats(loadChats());
      setCustom(loadCustomCharacters());
    };
    sync();
    window.addEventListener("noviasia:chats", sync);
    return () => window.removeEventListener("noviasia:chats", sync);
  }, []);

  const rows = useMemo(() => {
    return chats
      .map((c) => ({ chat: c, character: findCharacter(c.characterId, custom) }))
      .filter((r) => r.character)
      .filter((r) => {
        if (!q.trim()) return true;
        const s = q.toLowerCase();
        return (
          r.character!.name.toLowerCase().includes(s) ||
          r.character!.tagline.toLowerCase().includes(s)
        );
      })
      .sort((a, b) => b.chat.updatedAt - a.chat.updatedAt);
  }, [chats, custom, q]);

  const remove = (id: string) => {
    const next = loadChats().filter((c) => c.id !== id);
    saveChats(next);
    setChats(next);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
              <MessageSquare className="h-5 w-5 text-hot-400" />
              Mis chats
            </h1>
            <p className="mt-1 text-sm text-white/45">
              {rows.length === 0
                ? "Todavía no hablaste con nadie"
                : `${rows.length} conversación${rows.length === 1 ? "" : "es"} guardada${
                    rows.length === 1 ? "" : "s"
                  }`}
            </p>
          </div>
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar en tus chats…"
              className="w-full rounded-full border border-white/10 bg-white/[0.04] py-2.5 pl-9 pr-4 text-sm text-white placeholder:text-white/30 outline-none focus:border-hot-500/60"
            />
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 py-20 text-center">
            <p className="text-4xl">💬</p>
            <p className="mt-4 text-sm text-white/60">
              Acá van a aparecer tus conversaciones. Empezá con alguien.
            </p>
            <Link
              href="/"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-hot-500 to-grape-500 px-5 py-2.5 text-sm font-semibold text-white"
            >
              <Compass className="h-4 w-4" /> Descubrir personajes
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {rows.map(({ chat, character }) => {
              const last = chat.messages[chat.messages.length - 1];
              return (
                <div
                  key={chat.id}
                  className="group flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-ink-850/70 p-3 transition hover:border-white/20 hover:bg-ink-800"
                >
                  <Link href={`/chat/${character!.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                    <Avatar character={character!} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-white">
                          {character!.name}
                        </p>
                        <span className="text-[10px]">{character!.flag}</span>
                        <span className="text-[11px] text-white/30">
                          · {relativeTime(chat.updatedAt)}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-[13px] text-white/45">
                        {last?.role === "user" ? "Vos: " : ""}
                        {last?.content}
                      </p>
                    </div>
                  </Link>
                  <div className="flex items-center gap-1">
                    <span className="hidden rounded-full bg-white/[0.05] px-2 py-0.5 text-[10px] text-white/40 sm:block">
                      {chat.messages.length} msj
                    </span>
                    <button
                      onClick={() => remove(chat.id)}
                      className="grid h-8 w-8 place-items-center rounded-full text-white/30 transition hover:bg-red-500/15 hover:text-red-400"
                      aria-label="Borrar chat"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
