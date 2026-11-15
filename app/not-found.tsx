import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-6">
      <div className="text-center">
        <p className="text-6xl">💔</p>
        <h1 className="mt-6 text-2xl font-bold text-white">Esta persona no existe</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-white/45">
          O la borraste, o te bloqueó, o nunca existió. En NoviasIA las tres son
          posibilidades reales.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-gradient-to-r from-hot-500 to-grape-500 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Descubrir personajes
          </Link>
          <Link
            href="/crear"
            className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white/80 hover:bg-white/5"
          >
            Crear uno nuevo
          </Link>
        </div>
      </div>
    </div>
  );
}
