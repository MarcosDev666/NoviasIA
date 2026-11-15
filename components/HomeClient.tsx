"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, Sparkles, Flame, ArrowRight, Shuffle, TrendingUp } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CharacterCard from "./CharacterCard";
import Avatar from "./Avatar";
import { CHARACTERS } from "@/lib/characters";
import { allCharacters, loadCustomCharacters } from "@/lib/store";
import { VIBES, type Character, type VibeId } from "@/lib/types";

const DAILY = [CHARACTERS[0], CHARACTERS[1], CHARACTERS[7], CHARACTERS[3]];

export default function HomeClient() {
  const params = useSearchParams();
  const [custom, setCustom] = useState<Character[]>([]);
  const [query, setQuery] = useState("");
  const [vibe, setVibe] = useState<VibeId | "all">("all");

  useEffect(() => {
    const sync = () => setCustom(loadCustomCharacters());
    sync();
    window.addEventListener("noviasia:characters", sync);
    return () => window.removeEventListener("noviasia:characters", sync);
  }, []);

  useEffect(() => {
    const v = params.get("vibe") as VibeId | null;
    if (v && VIBES.some((x) => x.id === v)) setVibe(v);
  }, [params]);

  const characters = useMemo(() => allCharacters(custom), [custom]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return characters.filter((c) => {
      const okVibe = vibe === "all" || c.vibe === vibe;
      if (!okVibe) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.tagline.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [characters, query, vibe]);

  const randomChar = characters[Math.floor(Math.random() * characters.length)];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="pointer-events-none absolute inset-0 mesh opacity-90" />
        <div className="pointer-events-none absolute -top-28 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-hot-500/15 blur-[110px]" />
        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/70">
                <Sparkles className="h-3.5 w-3.5 text-hot-400" />
                {characters.length} personajes · chats ilimitados
              </div>

              <h1 className="text-balance text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl">
                Chateá con quien
                <br />
                <span className="bg-gradient-to-r from-hot-400 via-hot-500 to-grape-400 bg-clip-text text-transparent">
                  quieras, cuando quieras
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-balance text-[15px] leading-relaxed text-white/55 sm:text-base">
                Turras del conurbano, novias celosas, amigas del alma, gente re gila y
                personajes de todo el mundo. Elegí uno y empezá a hablar. Todos opinan de
                tu vida, para bien o para mal.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href={`/chat/${randomChar.id}`}
                  className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-hot-500 to-grape-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-hot-500/25 transition hover:opacity-95"
                >
                  <Shuffle className="h-4 w-4" />
                  Hablar con alguien random
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/crear"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/10"
                >
                  Crear mi personaje
                </Link>
              </div>

              <div className="mt-8 flex items-center gap-3">
                <div className="flex -space-x-2">
                  {DAILY.map((c) => (
                    <Avatar key={c.id} character={c} size="sm" ring />
                  ))}
                </div>
                <p className="text-xs leading-tight text-white/45">
                  Miles de chats abiertos ahora mismo
                  <br />
                  <span className="text-white/30">(y todos con drama)</span>
                </p>
              </div>
            </div>

            {/* Floating preview cards */}
            <div className="relative hidden h-[24rem] lg:block">
              <div className="absolute left-0 top-0 w-[19rem] animate-float rounded-2xl border border-white/10 bg-ink-850/90 p-4 shadow-2xl backdrop-blur">
                <div className="flex items-center gap-3">
                  <Avatar character={CHARACTERS[0]} size="sm" online />
                  <div>
                    <p className="text-sm font-semibold text-white">{CHARACTERS[0].name}</p>
                    <p className="text-[11px] text-emerald-400">en línea ahora</p>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <p className="w-fit rounded-2xl rounded-tl-sm bg-white/[0.07] px-3 py-2 text-[12.5px] text-white/80">
                    Uy, mirá quién apareció 😏 ¿me tenés abandonada?
                  </p>
                  <p className="ml-auto w-fit rounded-2xl rounded-tr-sm bg-hot-500 px-3 py-2 text-[12.5px] text-white">
                    Perdón, estaba laburando
                  </p>
                  <p className="w-fit rounded-2xl rounded-tl-sm bg-white/[0.07] px-3 py-2 text-[12.5px] text-white/80">
                    ¿Laburando? A las 2 AM, sí, seguro 💀
                  </p>
                </div>
              </div>

              <div
                className="absolute bottom-0 right-0 w-[16rem] animate-float rounded-2xl border border-white/10 bg-ink-850/90 p-4 shadow-2xl backdrop-blur"
                style={{ animationDelay: "1.2s" }}
              >
                <div className="flex items-center gap-3">
                  <Avatar character={CHARACTERS[1]} size="sm" online />
                  <div>
                    <p className="text-sm font-semibold text-white">{CHARACTERS[1].name}</p>
                    <p className="text-[11px] text-white/40">escribiendo…</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="typing-dot h-1.5 w-1.5 rounded-full bg-white/60"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DAILY */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold text-white">
              <TrendingUp className="h-5 w-5 text-hot-400" />
              Tendencias de hoy
            </h2>
            <p className="mt-1 text-sm text-white/45">Los que están rompiendo el algoritmo</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DAILY.map((c, i) => (
            <CharacterCard key={c.id} character={c} index={i} />
          ))}
        </div>
      </section>

      {/* FILTERS + ALL */}
      <section id="explorar" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                <Flame className="h-5 w-5 text-hot-400" />
                Explorar personajes
              </h2>
              <p className="mt-1 text-sm text-white/45">
                {filtered.length} personaje{filtered.length === 1 ? "" : "s"} para elegir
              </p>
            </div>
            <div className="relative w-full max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre, país, estilo…"
                className="w-full rounded-full border border-white/10 bg-white/[0.04] py-2.5 pl-9 pr-4 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-hot-500/60 focus:bg-white/[0.07]"
              />
            </div>
          </div>

          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
            <button
              onClick={() => setVibe("all")}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
                vibe === "all"
                  ? "border-transparent bg-white text-ink-950"
                  : "border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/10"
              }`}
            >
              ✨ Todos
            </button>
            {VIBES.map((v) => (
              <button
                key={v.id}
                onClick={() => setVibe(v.id)}
                title={v.desc}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
                  vibe === v.id
                    ? "border-transparent bg-white text-ink-950"
                    : "border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/10"
                }`}
              >
                {v.emoji} {v.label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center">
            <p className="text-3xl">🕵️</p>
            <p className="mt-3 text-sm text-white/60">
              No encontramos a nadie con eso. Probá con otra cosa.
            </p>
            <button
              onClick={() => {
                setQuery("");
                setVibe("all");
              }}
              className="mt-4 rounded-full bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((c, i) => (
              <CharacterCard key={c.id} character={c} index={i} />
            ))}
            <Link
              href="/crear"
              className="flex min-h-[16rem] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-6 text-center transition hover:border-hot-500/50 hover:bg-white/[0.05]"
            >
              <span className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-hot-500 to-grape-500 text-2xl">
                +
              </span>
              <p className="text-sm font-semibold text-white">Creá tu personaje</p>
              <p className="max-w-[14rem] text-xs text-white/45">
                Inventá a tu propia turra, celosa o amiga. Vos ponés la personalidad.
              </p>
            </Link>
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-hot-500/20 via-grape-500/10 to-transparent p-8 sm:p-12">
          <div className="relative z-10 max-w-xl">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              ¿Nadie te entiende? Inventá a quién sí.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              Creá un personaje con su propia personalidad, sus celos, su toxicidad y su
              forma de hablar. En 2 minutos ya está listo para pelearse con vos.
            </p>
            <Link
              href="/crear"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-white/90"
            >
              Crear personaje <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="pointer-events-none absolute -right-10 -top-10 text-[13rem] opacity-10 select-none">
            💅
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
