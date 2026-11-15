"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="grid min-h-screen place-items-center px-6">
      <div className="text-center">
        <p className="text-5xl">🫠</p>
        <h1 className="mt-5 text-xl font-bold text-white">Se rompió algo</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-white/45">
          A veces pasa. Ni la IA es perfecta (aunque diga que sí).
        </p>
        <button
          onClick={reset}
          className="mt-6 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink-950"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}
