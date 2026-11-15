"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Send,
  Sparkles,
  Trash2,
  RotateCcw,
  Heart,
  Share2,
  MoreVertical,
  PanelLeftOpen,
  Wand2,
  Check,
} from "lucide-react";
import Avatar from "./Avatar";
import {
  allCharacters,
  createChat,
  findCharacter,
  loadChats,
  loadCustomCharacters,
  loadProfile,
  relativeTime,
  saveChats,
  uid,
  type Profile,
} from "@/lib/store";
import type { Chat, Character, Message } from "@/lib/types";

type Reaction = "❤️" | "😡" | "😂" | "💀";

function traitBar(label: string, value: number, color: string) {
  return (
    <div key={label}>
      <div className="mb-1 flex items-center justify-between text-[11px]">
        <span className="text-white/50">{label}</span>
        <span className="font-semibold text-white/70">{value}/10</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${value * 10}%`, background: color }}
        />
      </div>
    </div>
  );
}

export default function ChatClient({ characterId }: { characterId: string }) {
  const router = useRouter();
  const [custom, setCustom] = useState<Character[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [chat, setChat] = useState<Chat | null>(null);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [profile, setProfile] = useState<Profile>({ name: "Invitado", emoji: "🫥" });
  const [showInfo, setShowInfo] = useState(false);
  const [showChats, setShowChats] = useState(false);
  const [reactions, setReactions] = useState<Record<string, Reaction>>({});
  const [engine, setEngine] = useState<string>("local");
  const [suggestionsUsed, setSuggestionsUsed] = useState(false);
  const [copied, setCopied] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const character = useMemo(
    () => findCharacter(characterId, custom) ?? allCharacters(custom)[0],
    [characterId, custom]
  );

  /* ---- init: custom chars, profile, chat ---- */
  useEffect(() => {
    const c = loadCustomCharacters();
    setCustom(c);
    setProfile(loadProfile());
    const list = loadChats();
    setChats(list);
    const char = findCharacter(characterId, c);
    if (!char) {
      router.replace("/");
      return;
    }
    const existing = list.find((x) => x.characterId === characterId);
    if (existing) {
      setChat(existing);
    } else {
      const fresh = createChat(char);
      const next = [fresh, ...list];
      setChats(next);
      saveChats(next);
      setChat(fresh);
    }
  }, [characterId, router]);

  useEffect(() => {
    fetch("/api/chat")
      .then((r) => r.json())
      .then((d) => setEngine(d.engine === "local" ? "local" : d.model || d.engine))
      .catch(() => setEngine("local"));
  }, []);

  /* sync across tabs */
  useEffect(() => {
    const sync = () => {
      const list = loadChats();
      setChats(list);
      const cur = list.find((x) => x.characterId === characterId);
      if (cur) setChat(cur);
    };
    window.addEventListener("noviasia:chats", sync);
    return () => window.removeEventListener("noviasia:chats", sync);
  }, [characterId]);

  const scrollToBottom = useCallback((smooth = true) => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
    });
  }, []);

  useEffect(() => {
    scrollToBottom(false);
  }, [chat?.id, scrollToBottom]);

  const persist = useCallback(
    (nextChat: Chat) => {
      const list = loadChats();
      const idx = list.findIndex((c) => c.id === nextChat.id);
      const updated = { ...nextChat, updatedAt: Date.now() };
      const next = idx >= 0 ? list.map((c, i) => (i === idx ? updated : c)) : [updated, ...list];
      setChats(next);
      saveChats(next);
      setChat(updated);
    },
    []
  );

  const send = useCallback(
    async (raw?: string) => {
      const text = (raw ?? input).trim();
      if (!text || typing || !chat || !character) return;
      setInput("");
      setSuggestionsUsed(true);

      const userMsg: Message = {
        id: uid("msg"),
        role: "user",
        content: text,
        createdAt: Date.now(),
      };
      const withUser: Chat = { ...chat, messages: [...chat.messages, userMsg] };
      persist(withUser);
      scrollToBottom();

      setTyping(true);
      const started = Date.now();

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            character,
            messages: withUser.messages.map((m) => ({ role: m.role, content: m.content })),
            userName: profile.name !== "Invitado" ? profile.name : undefined,
          }),
        });
        const data = await res.json();
        const reply: string =
          data.reply || "Uh, me quedé en blanco. ¿Me lo repetís?";

        // Latencia humana: que no responda instantáneo
        const minDelay = 700 + Math.min(reply.length * 12, 1600);
        const elapsed = Date.now() - started;
        if (elapsed < minDelay) {
          await new Promise((r) => setTimeout(r, minDelay - elapsed));
        }

        const botMsg: Message = {
          id: uid("msg"),
          role: "assistant",
          content: reply,
          createdAt: Date.now(),
        };
        const latest = loadChats().find((c) => c.id === chat.id) ?? withUser;
        persist({ ...latest, messages: [...latest.messages, botMsg] });
      } catch {
        const botMsg: Message = {
          id: uid("msg"),
          role: "assistant",
          content: "Uy, se me cortó el wifi emocional. Probá de nuevo 😅",
          createdAt: Date.now(),
        };
        const latest = loadChats().find((c) => c.id === chat.id) ?? withUser;
        persist({ ...latest, messages: [...latest.messages, botMsg] });
      } finally {
        setTyping(false);
        scrollToBottom();
        inputRef.current?.focus();
      }
    },
    [chat, character, input, persist, profile.name, scrollToBottom, typing]
  );

  const reset = useCallback(() => {
    if (!character) return;
    const fresh = createChat(character);
    const list = loadChats().filter((c) => c.characterId !== character.id);
    const next = [fresh, ...list];
    setChats(next);
    saveChats(next);
    setChat(fresh);
    setReactions({});
    setSuggestionsUsed(false);
  }, [character]);

  const removeChat = useCallback(() => {
    const list = loadChats().filter((c) => c.characterId !== characterId);
    saveChats(list);
    router.push("/chats");
  }, [characterId, router]);

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  if (!character || !chat) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="flex items-center gap-3 text-white/50">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white/70" />
          Cargando chat…
        </div>
      </div>
    );
  }

  const userMessages = chat.messages.filter((m) => m.role === "user").length;
  const charChats = chats.filter((c) => c.characterId !== characterId);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-ink-950">
      {/* HEADER */}
      <header className="z-20 flex h-16 shrink-0 items-center gap-3 border-b border-white/[0.07] bg-ink-900/80 px-3 backdrop-blur sm:px-5">
        <button
          onClick={() => router.push("/")}
          className="grid h-9 w-9 place-items-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white"
          aria-label="Volver"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <button
          onClick={() => setShowInfo(true)}
          className="flex min-w-0 items-center gap-3 text-left"
        >
          <Avatar character={character} size="sm" online />
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-white">
              {character.name}
              <span className="text-[10px]">{character.flag}</span>
            </p>
            <p className="truncate text-[11px] text-emerald-400">
              {typing ? "escribiendo…" : "en línea"}
            </p>
          </div>
        </button>

        <div className="ml-auto flex items-center gap-1">
          <span className="hidden rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-medium text-white/40 sm:block">
            {engine === "local" ? "motor local" : engine}
          </span>
          <button
            onClick={share}
            className="grid h-9 w-9 place-items-center rounded-full text-white/55 transition hover:bg-white/10 hover:text-white"
            aria-label="Compartir"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4" />}
          </button>
          <button
            onClick={reset}
            className="grid h-9 w-9 place-items-center rounded-full text-white/55 transition hover:bg-white/10 hover:text-white"
            aria-label="Reiniciar chat"
            title="Reiniciar chat"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowInfo(true)}
            className="grid h-9 w-9 place-items-center rounded-full text-white/55 transition hover:bg-white/10 hover:text-white"
            aria-label="Info"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* CHAT LIST (desktop) */}
        <aside className="hidden w-64 shrink-0 flex-col border-r border-white/[0.06] bg-ink-900/40 lg:flex">
          <div className="flex items-center justify-between px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/35">
              Mis chats
            </p>
            <Link href="/chats" className="text-[11px] text-hot-400 hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto px-2 pb-4">
            {charChats.length === 0 && (
              <p className="px-3 py-6 text-xs leading-relaxed text-white/30">
                Todavía no tenés otros chats. Andá a descubrir personajes.
              </p>
            )}
            {charChats.map((c) => {
              const ch = findCharacter(c.characterId, custom);
              if (!ch) return null;
              const last = c.messages[c.messages.length - 1];
              return (
                <Link
                  key={c.id}
                  href={`/chat/${ch.id}`}
                  className="flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 transition hover:bg-white/[0.06]"
                >
                  <Avatar character={ch} size="xs" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-white/85">{ch.name}</p>
                    <p className="truncate text-[11px] text-white/35">{last?.content}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </aside>

        {/* MESSAGES */}
        <main className="relative flex min-w-0 flex-1 flex-col">
          <div className="pointer-events-none absolute inset-0 mesh opacity-[0.35]" />
          <div className="relative flex-1 overflow-y-auto px-3 py-6 sm:px-6">
            <div className="mx-auto flex max-w-3xl flex-col gap-1">
              {/* Card de presentación */}
              <div className="mb-6 flex flex-col items-center text-center">
                <Avatar character={character} size="xl" ring />
                <h2 className="mt-4 text-xl font-bold text-white">{character.name}</h2>
                <p className="mt-1 max-w-md text-balance text-xs leading-relaxed text-white/45">
                  {character.tagline}
                </p>
                <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                  {character.tags.map((tg) => (
                    <span
                      key={tg}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-white/50"
                    >
                      {tg}
                    </span>
                  ))}
                </div>
              </div>

              {chat.messages.map((m, i) => {
                const isUser = m.role === "user";
                const prev = chat.messages[i - 1];
                const grouped = prev && prev.role === m.role && i > 0;
                return (
                  <div
                    key={m.id}
                    className={`msg-in group flex gap-2.5 ${isUser ? "flex-row-reverse" : ""} ${
                      grouped ? "mt-0.5" : "mt-4"
                    }`}
                  >
                    <div className={`w-8 shrink-0 ${grouped ? "opacity-0" : ""}`}>
                      {isUser ? (
                        <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-grape-500 to-hot-500 text-sm">
                          {profile.emoji}
                        </div>
                      ) : (
                        <Avatar character={character} size="xs" />
                      )}
                    </div>

                    <div className={`flex max-w-[85%] flex-col sm:max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
                      <div
                        className={`whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2.5 text-[14.5px] leading-relaxed ${
                          isUser
                            ? "rounded-tr-sm bg-gradient-to-br from-hot-500 to-hot-600 text-white"
                            : "rounded-tl-sm border border-white/[0.07] bg-ink-800/90 text-white/90"
                        }`}
                      >
                        {m.content}
                      </div>

                      <div
                        className={`mt-1 flex items-center gap-2 opacity-0 transition group-hover:opacity-100 ${
                          isUser ? "flex-row-reverse" : ""
                        }`}
                      >
                        <span className="text-[10px] text-white/25">
                          {new Date(m.createdAt).toLocaleTimeString("es-AR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {!isUser && (
                          <div className="flex items-center gap-0.5">
                            {(["❤️", "😡", "😂", "💀"] as Reaction[]).map((r) => (
                              <button
                                key={r}
                                onClick={() =>
                                  setReactions((prev) =>
                                    prev[m.id] === r
                                      ? { ...prev, [m.id]: undefined as unknown as Reaction }
                                      : { ...prev, [m.id]: r }
                                  )
                                }
                                className={`rounded-full px-1 py-0.5 text-xs transition hover:scale-125 ${
                                  reactions[m.id] === r ? "bg-white/10" : ""
                                }`}
                              >
                                {r}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {typing && (
                <div className="mt-4 flex items-end gap-2.5">
                  <Avatar character={character} size="xs" />
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-white/[0.07] bg-ink-800/90 px-4 py-3">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="typing-dot h-1.5 w-1.5 rounded-full bg-white/70"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div ref={bottomRef} className="h-4" />
            </div>
          </div>

          {/* COMPOSER */}
          <div className="relative shrink-0 border-t border-white/[0.06] bg-ink-900/80 px-2 pb-3 pt-2 backdrop-blur sm:px-6 sm:pb-4">
            <div className="mx-auto max-w-3xl">
              {!suggestionsUsed && userMessages === 0 && (
                <div className="no-scrollbar mb-2 flex gap-2 overflow-x-auto pb-1">
                  {character.suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="shrink-0 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs text-white/70 transition hover:border-hot-500/50 hover:bg-white/10 hover:text-white"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-end gap-2 rounded-[1.4rem] border border-white/10 bg-ink-800/90 p-1.5 pl-3 focus-within:border-hot-500/50">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  rows={1}
                  placeholder={`Escribile a ${character.name}…`}
                  className="max-h-32 min-h-[38px] flex-1 resize-none bg-transparent py-2.5 text-sm text-white placeholder:text-white/30 outline-none"
                  style={{ height: "auto" }}
                  onInput={(e) => {
                    const el = e.currentTarget;
                    el.style.height = "auto";
                    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
                  }}
                />
                <button
                  onClick={() => send()}
                  disabled={!input.trim() || typing}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-hot-500 to-grape-500 text-white transition disabled:opacity-35"
                  aria-label="Enviar"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-1.5 text-center text-[10px] text-white/25">
                {character.name} es un personaje ficticio. Todo lo que dice es inventado.
              </p>
            </div>
          </div>
        </main>
      </div>

      {/* INFO PANEL */}
      {showInfo && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setShowInfo(false)}
          />
          <aside className="relative flex h-full w-full max-w-sm flex-col overflow-y-auto border-l border-white/10 bg-ink-900 animate-fade-up">
            <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
              <p className="text-sm font-semibold text-white">Sobre {character.name}</p>
              <button
                onClick={() => setShowInfo(false)}
                className="rounded-full px-2 py-1 text-white/50 hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col items-center px-5 py-7 text-center">
              <Avatar character={character} size="xl" ring />
              <h3 className="mt-4 text-lg font-bold text-white">{character.name}</h3>
              <p className="text-xs text-white/40">
                {character.flag} {character.country} · {character.chats ?? "nuevo"} chats
              </p>
              <p className="mt-4 text-[13px] leading-relaxed text-white/60">
                {character.description}
              </p>
            </div>

            <div className="space-y-3 border-t border-white/[0.07] px-5 py-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/35">
                Personalidad
              </p>
              {traitBar("Celos", character.traits.celos, "linear-gradient(90deg,#f43f5e,#ff3d8b)")}
              {traitBar("Toxicidad", character.traits.toxica, "linear-gradient(90deg,#a855f7,#f43f5e)")}
              {traitBar("Cariño", character.traits.carino, "linear-gradient(90deg,#f472b6,#a78bfa)")}
              {traitBar("Humor", character.traits.humor, "linear-gradient(90deg,#facc15,#f97316)")}
              {traitBar("Intensidad", character.traits.intensidad, "linear-gradient(90deg,#ef4444,#f97316)")}
            </div>

            <div className="space-y-2 border-t border-white/[0.07] px-5 py-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/35">
                Acciones
              </p>
              <button
                onClick={() => {
                  reset();
                  setShowInfo(false);
                }}
                className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white/80 transition hover:bg-white/[0.07]"
              >
                <RotateCcw className="h-4 w-4" /> Reiniciar conversación
              </button>
              <button
                onClick={share}
                className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white/80 transition hover:bg-white/[0.07]"
              >
                <Share2 className="h-4 w-4" /> Compartir este personaje
              </button>
              <button
                onClick={() => {
                  removeChat();
                }}
                className="flex w-full items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-300 transition hover:bg-red-500/20"
              >
                <Trash2 className="h-4 w-4" /> Borrar este chat
              </button>
            </div>

            <div className="mt-auto border-t border-white/[0.07] px-5 py-4 text-[10px] leading-relaxed text-white/25">
              Este personaje es ficción generada por IA. No representa a ninguna persona
              real. Si algo te hace mal, cerrá la app y hablá con alguien de verdad. 💙
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
