import Link from "next/link";
import { Flame } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-white/[0.06] bg-ink-900/60">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <div className="mb-3 flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-hot-500 to-grape-500">
                <Flame className="h-4 w-4 text-white" />
              </span>
              <span className="font-bold text-white">
                Novias<span className="text-hot-400">IA</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-white/45">
              Chats con personajes que parecen de verdad. Turras, celosas, tóxicas, amigas
              y gente de todo el mundo. Todo inventado, nada real.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
                Explorar
              </h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li><Link href="/" className="hover:text-white">Descubrir</Link></li>
                <li><Link href="/chats" className="hover:text-white">Mis chats</Link></li>
                <li><Link href="/crear" className="hover:text-white">Crear personaje</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
                Estilos
              </h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li><Link href="/?vibe=turra" className="hover:text-white">Turras</Link></li>
                <li><Link href="/?vibe=celosa" className="hover:text-white">Celosas</Link></li>
                <li><Link href="/?vibe=toxica" className="hover:text-white">Tóxicas</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
                Legal
              </h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li><Link href="/legal" className="hover:text-white">Términos</Link></li>
                <li><Link href="/legal#privacidad" className="hover:text-white">Privacidad</Link></li>
                <li><Link href="/perfil" className="hover:text-white">Mi perfil</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-white/[0.06] pt-6 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} NoviasIA. Todos los personajes son ficción.</p>
          <p>Hecho con 🧉 en Argentina</p>
        </div>
      </div>
    </footer>
  );
}
