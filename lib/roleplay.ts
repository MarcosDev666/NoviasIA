import type { Message, Speech } from "./types";

/**
 * Detecta cuánta intensidad emocional trae el mensaje del usuario.
 * "te amo" -> 1, "TE AMO" -> 2, "te rreee amoo" -> 2, "te rreee amooo maaas" -> 3
 */
export function detectIntensity(raw: string): 0 | 1 | 2 | 3 {
  let score = 0;
  const t = raw || "";

  // Mayúsculas sostenidas
  const letters = t.replace(/[^a-zA-ZÁÉÍÓÚÑáéíóúñ]/g, "");
  if (letters.length > 3) {
    const upper = t.replace(/[^A-ZÁÉÍÓÚÑ]/g, "").length;
    if (upper / letters.length > 0.6) score += 1;
  }

  // Letras repetidas: "rreee", "amoooo", "maaaas"
  if (/([a-záéíóúñ])\1{2,}/i.test(t)) score += 1;

  // Muchos signos: "!!!", "???", "!!"
  if (/[!?]{2,}/.test(t)) score += 1;

  // Alargue + mayúsculas juntos suben otro escalón
  const manyRepeats = (t.match(/([a-záéíóúñ])\1{2,}/gi) || []).length;
  if (manyRepeats >= 2) score += 1;

  // Emojis de amor en cantidad
  const hearts = (t.match(/[❤💕💖💗💓💞🥰😍💘]/g) || []).length;
  if (hearts >= 2) score += 1;

  return Math.min(score, 3) as 0 | 1 | 2 | 3;
}

/**
 * Normaliza "Te rreee amoo" -> "te amo", para poder detectar la intención.
 * Colapsa 3+ repetidas a una sola y 2 repetidas a una sola:
 * "rreee" -> "re", "amooo" -> "amo".
 */
export function normalizeForIntent(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/([a-záéíóúñ])\1+/gi, "$1");
}

/* ---------------- *acciones* ---------------- */

const ACTIONS: Record<string, string[]> = {
  greeting: [
    "te mira de reojo y sonríe",
    "deja el celular un segundo para mirarte",
    "se acomoda el pelo",
    "levanta la vista de golpe",
  ],
  love: [
    "se pone colorada hasta las orejas",
    "sonríe como una tonta mirando la pantalla",
    "se muerde el labio y no sabe qué contestar",
    "abraza el almohadón con fuerza",
    "suspira hondo",
  ],
  insult: [
    "abre grande los ojos",
    "cruza los brazos",
    "levanta una ceja, incrédula",
    "deja el teléfono un segundo y lo vuelve a agarrar",
  ],
  apology: [
    "baja la mirada",
    "suspira y se pasa la mano por la cara",
    "se queda callada unos segundos",
  ],
  excuse: [
    "revisa la hora en el celular",
    "se ríe sin ganas",
    "niega con la cabeza",
  ],
  ex: [
    "revolea los ojos con fuerza",
    "aprieta los dientes",
    "deja el celular sobre la mesa de golpe",
  ],
  jealousy_check: [
    "te estudia la cara buscando algo",
    "se queda en silencio un segundo de más",
    "juega con el borde de la manga",
  ],
  food: [
    "se agarra la panza",
    "abre la heladera mentalmente",
    "se relame",
  ],
  plan: [
    "ya está pensando qué ponerse",
    "se entusiasma y se sienta derecha",
    "agenda mentalmente",
  ],
  sad: [
    "se acerca y te pone una mano en el hombro",
    "baja la voz",
    "deja todo lo que estaba haciendo",
  ],
  bored: [
    "se tira en la cama boca arriba",
    "se estira",
    "busca algo para hacer con las manos",
  ],
  compliment: [
    "sonríe de costado, agrandada",
    "se toca el pelo, engrupida",
    "se ríe y aparta la vista",
  ],
  question: [
    "se queda pensando",
    "arruga la nariz",
    "mira para arriba como buscando la respuesta",
  ],
  short: [
    "levanta la vista esperando más",
    "se queda mirando el mensaje corto",
  ],
  goodbye: [
    "se queda mirando la pantalla un rato más",
    "levanta la mano para despedirse",
  ],
  generic: [
    "asiente despacio",
    "te mira con atención",
    "se acomoda en la silla",
    "juega con el pelo mientras te escucha",
  ],
};

export function buildAction(
  intent: string,
  characterName: string,
  narrates: boolean,
  scenes?: string[]
): string | null {
  if (!narrates) return null;

  // 40% de las veces usa una escena propia del personaje, si tiene
  let action: string;
  if (scenes && scenes.length && Math.random() < 0.4) {
    action = scenes[Math.floor(Math.random() * scenes.length)];
  } else {
    const pool = ACTIONS[intent] || ACTIONS.generic;
    action = pool[Math.floor(Math.random() * pool.length)];
  }

  // Si la escena ya viene redactada en tercera persona ("se ríe"), le anteponemos el nombre
  const clean = action.trim().replace(/^\*|\*$/g, "");
  const startsWithName = clean.toLowerCase().startsWith(characterName.toLowerCase());
  const body = startsWithName ? clean : `${characterName.toLowerCase()} ${clean}`;
  return `*${body}*`;
}

/* ---------------- formateo del mensaje ---------------- */

/**
 * Arma el mensaje final con el formato de rol que pidió el usuario:
 *
 *   *rocio te mira y sonríe*
 *   Rocio: te amo wachin, te amo todo ❤️
 */
export function formatInRole(
  characterName: string,
  text: string,
  opts: { action?: string | null; useName?: boolean } = {}
): string {
  const { action, useName = true } = opts;
  const lines: string[] = [];
  if (action) lines.push(action);
  lines.push(useName ? `${characterName}: ${text}` : text);
  return lines.join("\n");
}

/** Saca el prefijo "Nombre:" y las *acciones* para mostrar la burbuja limpia. */
export function stripRoleFormat(content: string): { action: string | null; text: string } {
  const lines = content.split("\n").filter((l) => l.trim().length);
  let action: string | null = null;
  const rest: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^\*.*\*$/.test(trimmed) && !action) {
      action = trimmed.slice(1, -1);
      continue;
    }
    rest.push(trimmed);
  }

  let text = rest.join(" ");
  // Quita un "Nombre:" al principio si lo hay
  text = text.replace(/^[A-ZÁÉÍÓÚÑ][\wáéíóúñ.]{1,20}:\s*/, "");
  return { action, text: text.trim() };
}

export function defaultSpeech(partial?: Partial<Speech>): Speech {
  return {
    narrates: true,
    emojiLevel: 2,
    catchphrases: [],
    petNames: [],
    ...partial,
  };
}

export function intensityBoost(intensity: number): string {
  switch (intensity) {
    case 3:
      return "se te nota re intenso y le encanta";
    case 2:
      return "se te nota el entusiasmo";
    default:
      return "";
  }
}

export type { Message };
