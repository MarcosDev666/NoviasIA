import type { Chat, Character, Message } from "./types";
import { CHARACTERS } from "./characters";

const CHATS_KEY = "noviasia.chats.v1";
const CUSTOM_KEY = "noviasia.characters.v1";
const PROFILE_KEY = "noviasia.profile.v1";

export type Profile = {
  name: string;
  emoji: string;
};

export const DEFAULT_PROFILE: Profile = { name: "Invitado", emoji: "🫥" };

export function uid(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadChats(): Chat[] {
  if (typeof window === "undefined") return [];
  return safeParse<Chat[]>(window.localStorage.getItem(CHATS_KEY), []);
}

export function saveChats(chats: Chat[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CHATS_KEY, JSON.stringify(chats));
  window.dispatchEvent(new Event("noviasia:chats"));
}

export function loadCustomCharacters(): Character[] {
  if (typeof window === "undefined") return [];
  return safeParse<Character[]>(window.localStorage.getItem(CUSTOM_KEY), []);
}

export function saveCustomCharacters(chars: Character[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CUSTOM_KEY, JSON.stringify(chars));
  window.dispatchEvent(new Event("noviasia:characters"));
}

export function loadProfile(): Profile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  return safeParse<Profile>(window.localStorage.getItem(PROFILE_KEY), DEFAULT_PROFILE);
}

export function saveProfile(p: Profile) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  window.dispatchEvent(new Event("noviasia:profile"));
}

export function allCharacters(custom: Character[] = []): Character[] {
  return [...CHARACTERS, ...custom];
}

export function findCharacter(id: string, custom: Character[] = []): Character | undefined {
  return allCharacters(custom).find((c) => c.id === id);
}

export function createChat(character: Character): Chat {
  const now = Date.now();
  const greeting: Message = {
    id: uid("msg"),
    role: "assistant",
    content: character.greeting,
    createdAt: now,
  };
  return {
    id: uid("chat"),
    characterId: character.id,
    messages: [greeting],
    createdAt: now,
    updatedAt: now,
  };
}

export function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "ahora";
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `hace ${d} d`;
  return new Date(ts).toLocaleDateString("es-AR", { day: "2-digit", month: "short" });
}

export function formatCount(n?: string | number): string {
  if (n === undefined) return "nuevo";
  if (typeof n === "string") return n;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
