/**
 * Genera standalone/noviasia.html: un único archivo HTML autónomo
 * (sin servidor, sin build) a partir de lib/characters.ts.
 *
 *   npm run build:html
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { CHARACTERS } from "../lib/characters";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

/** Gustos y disgustos por personaje: le dan el color local al motor. */
const FLAVOR: Record<string, { likes?: string[]; hates?: string[] }> = {
  "mili-turra": {
    likes: ["fernet con coca", "reggaetón", "la costanera de noche", "los viernes de joda"],
    hates: ["que le mientan", "las minitas que comentan tus fotos", "que no contestes"],
  },
  "rochi-celosa": {
    likes: ["estar pegada a vos", "los mensajes a las 3 de la mañana"],
    hates: ["tus stories borrosas", "que digas 'es mi amiga'", "el modo avión"],
  },
  "bri-toxica": {
    likes: ["el sad reggaetón", "llorar en el auto"],
    hates: ["que le digas 'relajá'", "las respuestas cortas"],
  },
  "sofi-amiga": {
    likes: ["chisme fresco", "los audios de 6 minutos", "el vino barato"],
    hates: ["que le mientas", "las personas que no contestan"],
  },
  "cami-regila": {
    likes: ["opinar de todo", "mirar conversaciones ajenas"],
    hates: ["la indiferencia", "que le digan 'no es para tanto'"],
  },
  "vale-romantica": {
    likes: ["los atardeceres", "las cartas escritas a mano", "la lluvia en la ventana"],
  },
  "chiara-caotica": {
    likes: ["la adrenalina", "las decisiones tomadas a las 4 AM"],
    hates: ["la rutina", "que le digan 'pensalo bien'"],
  },
  "tati-bonachona": {
    likes: ["la torta frita", "el té con leche", "cuidarte todo el día"],
    hates: ["la humedad", "que no abrigues"],
  },
  "kalei-brasil": {
    likes: ["la playa de Ipanema", "la samba", "los abrazos largos"],
    hates: ["la frialdad", "que no bailes"],
  },
  "lupe-mexico": {
    likes: ["tacos de la esquina", "tequila", "los chismes del mercado"],
  },
  "lucia-espana": {
    likes: ["el vermut", "las cámaras desechables", "el vino natural"],
  },
  "yara-cuba": {
    likes: ["la salsa en la cocina", "el café a las 11", "las velas"],
  },
  "milena-serbia": {
    likes: ["la lluvia", "los libros viejos", "el silencio incómodo"],
  },
  "hanna-alemania": {
    likes: ["el techno a las 6 AM", "las bicicletas", "la puntualidad"],
  },
  "luz-pelea": {
    likes: ["las canciones de desamor", "revisar tus historias"],
  },
  "juana-barrio": {
    likes: ["el asado con los pibes", "la biblioteca del barrio", "las marchas"],
  },
};

const payload = CHARACTERS.map((c) => ({
  id: c.id,
  name: c.name,
  tagline: c.tagline,
  description: c.description,
  greeting: c.greeting,
  vibe: c.vibe,
  country: c.country,
  flag: c.flag,
  accent: c.accent,
  emoji: c.emoji ?? "✨",
  tags: c.tags,
  suggestions: c.suggestions,
  traits: c.traits,
  official: c.official ?? false,
  chats: c.chats ?? "nuevo",
  likes: FLAVOR[c.id]?.likes ?? [],
  hates: FLAVOR[c.id]?.hates ?? [],
}));

const template = readFileSync(join(root, "standalone/template.html"), "utf8");
const json = JSON.stringify(payload, null, 2).replace(/</g, "\\u003c");

if (!template.includes("/*__CHARACTERS__*/")) {
  throw new Error("El template no tiene el placeholder /*__CHARACTERS__*/");
}

const html = template.replace("/*__CHARACTERS__*/[]", json);

mkdirSync(join(root, "standalone"), { recursive: true });
const out = join(root, "public/noviasia.html");
mkdirSync(join(root, "public"), { recursive: true });
writeFileSync(out, html, "utf8");
writeFileSync(join(root, "noviasia.html"), html, "utf8");

const kb = (Buffer.byteLength(html, "utf8") / 1024).toFixed(1);
console.log(`✓ public/noviasia.html y /noviasia.html generados (${payload.length} personajes, ${kb} KB)`);
