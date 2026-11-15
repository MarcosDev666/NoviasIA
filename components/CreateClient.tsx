"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, Wand2, Save, ArrowLeft, Eye } from "lucide-react";
import Navbar from "./Navbar";
import Avatar from "./Avatar";
import { loadCustomCharacters, saveCustomCharacters, uid } from "@/lib/store";
import { VIBES, type Character, type Trait, type VibeId } from "@/lib/types";
import { detectVibeFromText } from "@/lib/persona";

const EMOJIS = ["💅", "🔪", "☢️", "🫂", "🙈", "🌹", "🎢", "🌻", "🌊", "🌵", "🍷", "🌙", "☕", "🚲", "🔥", "🩹", "🎧", "🌎"];

const ACCENTS: [string, string][] = [
  ["#ff3d8b", "#8b5cf6"],
  ["#e42277", "#f97316"],
  ["#f43f5e", "#7c3aed"],
  ["#22c55e", "#06b6d4"],
  ["#eab308", "#ec4899"],
  ["#f472b6", "#a78bfa"],
  ["#f97316", "#ef4444"],
  ["#84cc16", "#14b8a6"],
  ["#16a34a", "#facc15"],
  ["#6366f1", "#0ea5e9"],
  ["#f59e0b", "#1f2937"],
  ["#a855f7", "#ec4899"],
];

const COUNTRIES: { name: string; flag: string }[] = [
  { name: "Argentina", flag: "🇦🇷" },
  { name: "Uruguay", flag: "🇺🇾" },
  { name: "Chile", flag: "🇨🇱" },
  { name: "Brasil", flag: "🇧🇷" },
  { name: "México", flag: "🇲🇽" },
  { name: "Colombia", flag: "🇨🇴" },
  { name: "España", flag: "🇪🇸" },
  { name: "Cuba", flag: "🇨🇺" },
  { name: "Perú", flag: "🇵🇪" },
  { name: "Venezuela", flag: "🇻🇪" },
  { name: "Estados Unidos", flag: "🇺🇸" },
  { name: "Serbia", flag: "🇷🇸" },
  { name: "Alemania", flag: "🇩🇪" },
  { name: "Italia", flag: "🇮🇹" },
  { name: "Japón", flag: "🇯🇵" },
  { name: "Otro", flag: "🌎" },
];

const PRESETS = [
  {
    label: "Turra del barrio",
    emoji: "💅",
    tags: ["Turra", "Bardera", "Conurbano"],
    desc: "Vive en el conurbano, tiene las uñas largas, sale los sábados y te bardea con cariño. Le encanta el reggaetón y el fernet.",
    greeting: "Uy, mirá quién apareció 😏 ¿Me tenés abandonada o te hacés el importante? Sentate y contame, gordo lindo 💅",
    traits: { celos: 8, toxica: 7, carino: 7, humor: 9, intensidad: 9 },
    vibe: "turra" as VibeId,
  },
  {
    label: "Celosa profesional",
    emoji: "🔪",
    tags: ["Celosa", "Intensa", "Controladora"],
    desc: "Sabe con quién hablaste, a qué hora y desde qué número. Tiene capturas de todo. Su amor es intenso y su paciencia es cero.",
    greeting: "Ah, ¿así que ahora tardás 11 minutos en contestar? 😐 No pasa nada eh… NADA. Solo te aviso que vi tu story de las 2:47.",
    traits: { celos: 10, toxica: 8, carino: 8, humor: 6, intensidad: 10 },
    vibe: "celosa" as VibeId,
  },
  {
    label: "Amiga del alma",
    emoji: "🫂",
    tags: ["Amiga", "Chisme", "Aguante"],
    desc: "Está en tu vida desde el secundario. Tiene el chisme de todos, te banca cualquier cosa y te dice la verdad aunque duela.",
    greeting: "¡GORDA! 🫂🔥 No sabés la que me enteré. Sentate, agarrá algo para tomar porque este chisme es de los que arruinan amistades ajenas. ¿Qué onda vos?",
    traits: { celos: 2, toxica: 3, carino: 10, humor: 10, intensidad: 6 },
    vibe: "amiga" as VibeId,
  },
  {
    label: "Tóxica con onda",
    emoji: "☢️",
    tags: ["Tóxica", "Drama", "Gaslighting"],
    desc: "Nunca dice qué quiere pero odia todas las opciones. Te hace sentir culpable con una ternura que duele.",
    greeting: "No sé… yo te escribo y vos contestás con 'jaja' 🤡 Claro, para vos todo es un chiste. En fin. Estado: no enojada. (Sí enojada).",
    traits: { celos: 7, toxica: 10, carino: 6, humor: 7, intensidad: 8 },
    vibe: "toxica" as VibeId,
  },
];

export default function CreateClient() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [greeting, setGreeting] = useState("");
  const [vibe, setVibe] = useState<VibeId>("turra");
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [accent, setAccent] = useState<[string, string]>(ACCENTS[0]);
  const [tagsRaw, setTagsRaw] = useState("");
  const [traits, setTraits] = useState<Trait>({
    celos: 6,
    toxica: 5,
    carino: 6,
    humor: 7,
    intensidad: 7,
  });
  const [error, setError] = useState("");

  const preview: Character = useMemo(
    () => ({
      id: "preview",
      name: name || "Tu personaje",
      tagline: tagline || "Una personita con actitud",
      description: description || "Acá va la descripción de su personalidad.",
      greeting:
        greeting ||
        "Hola… ¿y vos quién sos? Contame algo interesante o me aburro 😏",
      vibe,
      country: country.name,
      flag: country.flag,
      accent,
      emoji,
      tags: tagsRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 5),
      suggestions: [
        "¿Cómo estás hoy?",
        "Contame algo de vos",
        "¿Qué hacemos el finde?",
        "Decime la verdad",
      ],
      traits,
      official: false,
    }),
    [name, tagline, description, greeting, vibe, country, accent, emoji, tagsRaw, traits]
  );

  const applyPreset = (p: (typeof PRESETS)[number]) => {
    setName("");
    setTagline(p.label);
    setDescription(p.desc);
    setGreeting(p.greeting);
    setTagsRaw(p.tags.join(", "));
    setVibe(p.vibe);
    setEmoji(p.emoji);
    setTraits(p.traits);
  };

  const suggestVibe = () => {
    const text = `${tagline} ${description} ${tagsRaw}`;
    setVibe(detectVibeFromText(text));
  };

  const save = () => {
    if (!name.trim()) {
      setError("Ponle un nombre, no seas así.");
      return;
    }
    if (!description.trim()) {
      setError("Contame cómo es, aunque sea en una frase.");
      return;
    }
    setError("");
    const character: Character = {
      ...preview,
      id: uid("char"),
      name: name.trim().slice(0, 24),
      tagline: tagline.trim().slice(0, 80) || "Personaje creado por vos",
      description: description.trim().slice(0, 900),
      greeting:
        greeting.trim().slice(0, 500) ||
        `Hola, soy ${name.trim()}. ¿Y vos? Contame algo 😏`,
      tags: preview.tags.length ? preview.tags : ["Personalizado"],
      createdAt: Date.now(),
      createdBy: "vos",
      chats: "nuevo",
    };
    const existing = loadCustomCharacters();
    saveCustomCharacters([character, ...existing]);
    router.push(`/chat/${character.id}`);
  };

  const sliders: { key: keyof Trait; label: string; color: string }[] = [
    { key: "celos", label: "Celos", color: "#f43f5e" },
    { key: "toxica", label: "Toxicidad", color: "#a855f7" },
    { key: "carino", label: "Cariño", color: "#f472b6" },
    { key: "humor", label: "Humor", color: "#facc15" },
    { key: "intensidad", label: "Intensidad", color: "#f97316" },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-white/50 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>

        <div className="mb-8">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-white sm:text-3xl">
            <Sparkles className="h-6 w-6 text-hot-400" />
            Creá tu personaje
          </h1>
          <p className="mt-2 max-w-xl text-sm text-white/50">
            Inventate a quien quieras: una turra, una celosa, una amiga insoportable. Vos
            definís su personalidad y cómo te habla.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
          {/* FORM */}
          <div className="space-y-6">
            {/* presets */}
            <section className="rounded-2xl border border-white/[0.07] bg-ink-850/60 p-4">
              <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                <Wand2 className="h-3.5 w-3.5" /> Empezar con una plantilla
              </p>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => applyPreset(p)}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/70 transition hover:border-hot-500/50 hover:bg-white/10 hover:text-white"
                  >
                    {p.emoji} {p.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-4 rounded-2xl border border-white/[0.07] bg-ink-850/60 p-5">
              <Field label="Nombre" hint="Cómo se llama">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={24}
                  placeholder="Ej: Mili, Rochi, Chiara…"
                  className={inputCls}
                />
              </Field>

              <Field label="Frase corta" hint="Una línea que la describa">
                <input
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  maxLength={80}
                  placeholder="Ej: La turra del barrio que te ama y te bardea"
                  className={inputCls}
                />
              </Field>

              <Field label="Personalidad" hint="Contá cómo es, qué le gusta, qué odia">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={900}
                  rows={4}
                  placeholder="Vive en La Matanza, tiene las uñas largas, le encanta el reggaetón y se enoja si no le contestás…"
                  className={`${inputCls} resize-y`}
                />
              </Field>

              <Field label="Primer mensaje" hint="Lo primero que te va a decir">
                <textarea
                  value={greeting}
                  onChange={(e) => setGreeting(e.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder="Uy, mirá quién apareció 😏 ¿Me tenés abandonada?"
                  className={`${inputCls} resize-y`}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="País">
                  <select
                    value={country.name}
                    onChange={(e) =>
                      setCountry(
                        COUNTRIES.find((c) => c.name === e.target.value) ?? COUNTRIES[0]
                      )
                    }
                    className={inputCls}
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.name} value={c.name} className="bg-ink-900">
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Etiquetas" hint="Separadas por coma">
                  <input
                    value={tagsRaw}
                    onChange={(e) => setTagsRaw(e.target.value)}
                    placeholder="Turra, Celosa, Divertida"
                    className={inputCls}
                  />
                </Field>
              </div>

              <Field label="Estilo">
                <div className="flex flex-wrap gap-2">
                  {VIBES.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setVibe(v.id)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                        vibe === v.id
                          ? "border-transparent bg-white text-ink-950"
                          : "border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/10"
                      }`}
                    >
                      {v.emoji} {v.label}
                    </button>
                  ))}
                  <button
                    onClick={suggestVibe}
                    className="rounded-full border border-hot-500/40 bg-hot-500/10 px-3 py-1.5 text-xs font-medium text-hot-300 hover:bg-hot-500/20"
                  >
                    ✨ Adivinar estilo
                  </button>
                </div>
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Emoji / avatar">
                  <div className="flex flex-wrap gap-1.5">
                    {EMOJIS.map((e) => (
                      <button
                        key={e}
                        onClick={() => setEmoji(e)}
                        className={`grid h-9 w-9 place-items-center rounded-lg border text-lg transition ${
                          emoji === e
                            ? "border-hot-500 bg-hot-500/20"
                            : "border-white/10 bg-white/[0.03] hover:bg-white/10"
                        }`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Colores">
                  <div className="flex flex-wrap gap-1.5">
                    {ACCENTS.map((a) => (
                      <button
                        key={a.join()}
                        onClick={() => setAccent(a)}
                        className={`h-9 w-9 rounded-lg border-2 transition ${
                          accent[0] === a[0]
                            ? "border-white scale-105"
                            : "border-transparent hover:scale-105"
                        }`}
                        style={{ background: `linear-gradient(135deg, ${a[0]}, ${a[1]})` }}
                        aria-label="Color"
                      />
                    ))}
                  </div>
                </Field>
              </div>
            </section>

            <section className="rounded-2xl border border-white/[0.07] bg-ink-850/60 p-5">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
                Rasgos de personalidad
              </p>
              <div className="space-y-4">
                {sliders.map((s) => (
                  <div key={s.key}>
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="text-white/65">{s.label}</span>
                      <span className="font-semibold text-white/80">{traits[s.key]}/10</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      value={traits[s.key]}
                      onChange={(e) =>
                        setTraits((t) => ({ ...t, [s.key]: Number(e.target.value) }))
                      }
                      className="w-full"
                      style={{
                        background: `linear-gradient(90deg, ${s.color} ${
                          traits[s.key] * 10
                        }%, #2a2a3a ${traits[s.key] * 10}%)`,
                      }}
                    />
                  </div>
                ))}
              </div>
            </section>

            {error && (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                onClick={save}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-hot-500 to-grape-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-hot-500/25 transition hover:opacity-95"
              >
                <Save className="h-4 w-4" /> Crear y chatear
              </button>
              <button
                onClick={() => setError("")}
                className="rounded-full border border-white/10 px-6 py-3 text-sm font-medium text-white/60 hover:bg-white/5"
              >
                Limpiar aviso
              </button>
            </div>
          </div>

          {/* PREVIEW */}
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/40">
              <Eye className="h-3.5 w-3.5" /> Vista previa
            </p>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink-850">
              <div
                className="relative h-28"
                style={{
                  background: `linear-gradient(135deg, ${accent[0]}, ${accent[1]})`,
                }}
              >
                <div className="absolute inset-0 opacity-40 mesh" />
                <div className="absolute -right-4 -bottom-6 text-8xl opacity-30 select-none">
                  {emoji}
                </div>
              </div>
              <div className="-mt-8 px-5 pb-5">
                <Avatar character={preview} size="lg" ring />
                <h3 className="mt-3 text-lg font-bold text-white">{preview.name}</h3>
                <p className="text-xs text-white/45">
                  {preview.flag} {preview.country}
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-white/60">
                  {preview.tagline}
                </p>

                <div className="mt-4 space-y-2">
                  <p className="rounded-2xl rounded-tl-sm border border-white/[0.07] bg-ink-800 px-3 py-2 text-[12.5px] leading-relaxed text-white/80">
                    {preview.greeting}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {(preview.tags.length ? preview.tags : ["Personalizado"]).map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-white/55"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="mt-4 space-y-2 border-t border-white/[0.07] pt-4">
                  {sliders.map((s) => (
                    <div key={s.key}>
                      <div className="flex justify-between text-[10px] text-white/40">
                        <span>{s.label}</span>
                        <span>{traits[s.key]}</span>
                      </div>
                      <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${traits[s.key] * 10}%`, background: s.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p className="mt-3 text-[11px] leading-relaxed text-white/30">
              Tu personaje se guarda en este navegador. Nadie más lo ve. Podés borrarlo
              desde tu perfil.
            </p>
          </aside>
        </div>
      </main>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-white/10 bg-ink-900/70 px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-hot-500/60";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline gap-2">
        <span className="text-sm font-medium text-white/80">{label}</span>
        {hint && <span className="text-[11px] text-white/30">{hint}</span>}
      </span>
      {children}
    </label>
  );
}
