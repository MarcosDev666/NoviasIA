"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Flame, Compass, PlusCircle, MessageSquare, Menu, X } from "lucide-react";
import { loadProfile, type Profile, DEFAULT_PROFILE } from "@/lib/store";

const LINKS = [
  { href: "/", label: "Descubrir", icon: Compass },
  { href: "/chats", label: "Mis chats", icon: MessageSquare },
  { href: "/crear", label: "Crear", icon: PlusCircle },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);

  useEffect(() => {
    const sync = () => setProfile(loadProfile());
    sync();
    window.addEventListener("noviasia:profile", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("noviasia:profile", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-hot-500 to-grape-500 shadow-lg shadow-hot-500/25 transition-transform group-hover:scale-105">
            <Flame className="h-[18px] w-[18px] text-white" />
          </span>
          <span className="text-lg font-bold tracking-tight text-white">
            Novias<span className="text-hot-400">IA</span>
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {LINKS.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/55 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <a
            href="/noviasia.html"
            target="_blank"
            rel="noopener"
            className="hidden items-center gap-1.5 rounded-full border border-white/10 px-3.5 py-2 text-xs font-medium text-white/60 transition hover:bg-white/10 hover:text-white lg:flex"
            title="Abrir la versión de un solo archivo HTML"
          >
            Versión HTML
          </a>
          <Link
            href="/crear"
            className="hidden rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink-950 transition hover:bg-white/90 sm:block"
          >
            Crear personaje
          </Link>
          <Link
            href="/perfil"
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 pl-1 pr-3 transition hover:bg-white/10"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-grape-500 to-hot-500 text-sm">
              {profile.emoji}
            </span>
            <span className="max-w-[90px] truncate text-xs font-medium text-white/80">
              {profile.name}
            </span>
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/70 md:hidden"
            aria-label="Menú"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/[0.06] bg-ink-900 px-4 py-3 md:hidden">
          {LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/75 hover:bg-white/5"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
