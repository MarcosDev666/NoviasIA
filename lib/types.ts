export type Trait = {
  celos: number; // 0-10
  toxica: number;
  carino: number;
  humor: number;
  intensidad: number;
};

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
};

export type Chat = {
  id: string;
  characterId: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  pinned?: boolean;
  unread?: number;
};

export type Character = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  greeting: string;
  vibe: VibeId;
  country: string;
  flag: string;
  accent: string[]; // [from, to] tailwind-safe hex
  avatar?: string; // image path, else emoji avatar
  emoji?: string;
  tags: string[];
  suggestions: string[];
  traits: Trait;
  nsfwFilter?: boolean;
  official?: boolean;
  chats?: string;
  createdBy?: string;
  createdAt?: number;
};

export type VibeId =
  | "turra"
  | "celosa"
  | "toxica"
  | "amiga"
  | "regila"
  | "romantica"
  | "caotica"
  | "bonachona"
  | "internacional";

export type Vibe = {
  id: VibeId;
  label: string;
  emoji: string;
  desc: string;
};

export const VIBES: Vibe[] = [
  { id: "turra", label: "Turras", emoji: "💅", desc: "Actitud, uñas y barrio" },
  { id: "celosa", label: "Celosas", emoji: "🔪", desc: "¿Con quién hablabas?" },
  { id: "toxica", label: "Tóxicas", emoji: "☢️", desc: "Amor con veneno" },
  { id: "amiga", label: "Amigues", emoji: "🫂", desc: "Para el chisme y el aguante" },
  { id: "regila", label: "Re gilas", emoji: "🙈", desc: "Cero filtro, cero vergüenza" },
  { id: "romantica", label: "Románticas", emoji: "🌹", desc: "Cursis nivel máximo" },
  { id: "caotica", label: "Caóticas", emoji: "🎢", desc: "Un peligro hermoso" },
  { id: "internacional", label: "Del mundo", emoji: "🌎", desc: "Otros países, otros dramas" },
];
