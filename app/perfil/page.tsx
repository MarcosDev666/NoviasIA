"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User, Trash2, Save, MessageSquare, Sparkles, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Avatar from "@/components/Avatar";
import {
  DEFAULT_PROFILE,
  loadChats,
  loadCustomCharacters,
  loadProfile,
  saveChats,
  saveCustomCharacters,
  saveProfile,
  type Profile,
} from "@/lib/store";
import type { Character } from "@/lib/types";

const EMOJIS = ["🫥", "😎", "🦊", "🐺", "🧉", "🔥", "👽", "🐸", "💀", "🥷", "🦁", "🐼", "👾", "🌚", "🎸", "⚡"];

export default function PerfilPage() {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [custom, setCustom] = useState<Character[]>([]);
  const [chatCount, setChatCount] = useState(0);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setProfile(loadProfile());
    setCustom(loadCustomCharacters());
    setChatCount(loadChats().length);
  }, []);

  const persist = () => {
    saveProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const deleteChar = (id: string) => {
    const next = custom.filter((c) => c.id !== id);
    saveCustomCharacters(next);
    setCustom(next);
    const chats = loadChats().filter((c) => c.characterId !== id);
    saveChats(chats);
    setChatCount(chats.length);
  };

  const clearAll = () => {
    if (!confirm("¿Borrar todos los chats? Esto no se puede deshacer.")) return;
    saveChats([]);
    setChatCount(0);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
          <User className="h-5 w-5 text-hot-400" /> Mi perfil
        </h1>
        <p className="mt-1 text-sm text-white/45">
          Todo se guarda en tu navegador. Sin cuentas, sin contraseñas.
        </p>

        <section className="mt-8 rounded-2xl border border-white/[0.07] bg-ink-850/60 p-5">
          <div className="flex items-center gap-4">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-grape-500 to-hot-500 text-3xl">
              {profile.emoji}
            </span>
            <div className="flex-1">
              <label className="block text-xs font-medium text-white/50">Tu nombre</label>
              <input
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value.slice(0, 20) })}
                placeholder="¿Cómo te llamás?"
                className="mt-1 w-full rounded-xl border border-white/10 bg-ink-900/70 px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-hot-500/60"
              />
            </div>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-xs font-medium text-white/50">Tu avatar</p>
            <div className="flex flex-wrap gap-1.5">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => setProfile({ ...profile, emoji: e })}
                  className={`grid h-9 w-9 place-items-center rounded-lg border text-lg transition ${
                    profile.emoji === e
                      ? "border-hot-500 bg-hot-500/20"
                      : "border-white/10 bg-white/[0.03] hover:bg-white/10"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={persist}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-hot-500 to-grape-500 px-5 py-2.5 text-sm font-semibold text-white"
          >
            {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saved ? "Guardado" : "Guardar cambios"}
          </button>
        </section>

        <section className="mt-6 grid gap-3 sm:grid-cols-3">
          <Stat icon={<MessageSquare className="h-4 w-4" />} label="Chats" value={chatCount} />
          <Stat icon={<Sparkles className="h-4 w-4" />} label="Creados" value={custom.length} />
          <Stat
            icon={<User className="h-4 w-4" />}
            label="Modo"
            value="Local"
            hint="Sin cuenta"
          />
        </section>

        <section className="mt-6 rounded-2xl border border-white/[0.07] bg-ink-850/60 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Mis personajes</h2>
              <p className="text-xs text-white/40">Los que creaste vos</p>
            </div>
            <Link
              href="/crear"
              className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10"
            >
              + Crear
            </Link>
          </div>

          {custom.length === 0 ? (
            <p className="py-6 text-center text-xs text-white/35">
              Todavía no creaste ninguno. Animáte.
            </p>
          ) : (
            <div className="space-y-2">
              {custom.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-ink-900/50 p-2.5"
                >
                  <Avatar character={c} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{c.name}</p>
                    <p className="truncate text-[11px] text-white/40">{c.tagline}</p>
                  </div>
                  <Link
                    href={`/chat/${c.id}`}
                    className="rounded-full bg-white/10 px-3 py-1.5 text-[11px] text-white hover:bg-white/20"
                  >
                    Chatear
                  </Link>
                  <button
                    onClick={() => deleteChar(c.id)}
                    className="grid h-8 w-8 place-items-center rounded-full text-white/30 hover:bg-red-500/15 hover:text-red-400"
                    aria-label="Borrar personaje"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-5">
          <h2 className="text-sm font-semibold text-white">Zona peligrosa</h2>
          <p className="mt-1 text-xs text-white/45">
            Borra todas tus conversaciones de este navegador.
          </p>
          <button
            onClick={clearAll}
            className="mt-3 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-medium text-red-300 hover:bg-red-500/20"
          >
            <Trash2 className="h-3.5 w-3.5" /> Borrar todos los chats
          </button>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-ink-850/60 p-4">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-white/35">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-xl font-bold text-white">{value}</p>
      {hint && <p className="text-[10px] text-white/30">{hint}</p>}
    </div>
  );
}
