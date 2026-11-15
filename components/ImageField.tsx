"use client";

import { useRef, useState } from "react";
import { ImagePlus, Link2, Trash2, Upload, X } from "lucide-react";

/**
 * Sube una imagen (archivo o link) y devuelve un data URL / URL.
 * Las imágenes se comprimen a máx. 512px para no llenar localStorage.
 */
export function fileToDataUrl(file: File, maxSize = 512, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("El archivo no es una imagen válida"));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Sin canvas"));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function ImageField({
  label,
  hint,
  value,
  onChange,
  aspect = "square",
  fallback,
}: {
  label: string;
  hint?: string;
  value?: string;
  onChange: (v: string | undefined) => void;
  aspect?: "square" | "wide";
  fallback?: React.ReactNode;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [showUrl, setShowUrl] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    setErr("");
    if (!file.type.startsWith("image/")) {
      setErr("Ese archivo no es una imagen.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setErr("Muy pesada (máx 8 MB).");
      return;
    }
    setBusy(true);
    try {
      const data = await fileToDataUrl(file, aspect === "wide" ? 900 : 512);
      onChange(data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Falló la subida");
    } finally {
      setBusy(false);
    }
  };

  const applyUrl = () => {
    const v = url.trim();
    if (!v) return;
    if (!/^https?:\/\//i.test(v) && !v.startsWith("data:")) {
      setErr("El link tiene que empezar con http:// o https://");
      return;
    }
    setErr("");
    onChange(v);
    setUrl("");
    setShowUrl(false);
  };

  return (
    <div>
      <div className="mb-1.5 flex items-baseline gap-2">
        <span className="text-sm font-medium text-white/80">{label}</span>
        {hint && <span className="text-[11px] text-white/30">{hint}</span>}
      </div>

      <div className="flex items-start gap-3">
        <div
          className={`relative shrink-0 overflow-hidden rounded-xl border border-white/10 bg-ink-900 ${
            aspect === "square" ? "h-20 w-20" : "h-20 w-32"
          }`}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt={label} className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center text-2xl opacity-30">
              {fallback ?? <ImagePlus className="h-6 w-6" />}
            </div>
          )}
          {busy && (
            <div className="absolute inset-0 grid place-items-center bg-black/60">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/25 border-t-white" />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs font-medium text-white/75 transition hover:bg-white/10"
            >
              <Upload className="h-3.5 w-3.5" /> Subir archivo
            </button>
            <button
              type="button"
              onClick={() => setShowUrl((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs font-medium text-white/75 transition hover:bg-white/10"
            >
              <Link2 className="h-3.5 w-3.5" /> Pegar link
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange(undefined)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/25 bg-red-500/10 px-2.5 py-1.5 text-xs font-medium text-red-300 transition hover:bg-red-500/20"
              >
                <Trash2 className="h-3.5 w-3.5" /> Quitar
              </button>
            )}
          </div>

          {showUrl && (
            <div className="flex gap-1.5">
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    applyUrl();
                  }
                }}
                placeholder="https://.../foto.jpg"
                className="min-w-0 flex-1 rounded-lg border border-white/10 bg-ink-900/70 px-2.5 py-1.5 text-xs text-white placeholder:text-white/25 outline-none focus:border-hot-500/60"
              />
              <button
                type="button"
                onClick={applyUrl}
                className="rounded-lg bg-white/10 px-2.5 py-1.5 text-xs text-white hover:bg-white/20"
              >
                Usar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUrl(false);
                  setUrl("");
                }}
                className="grid place-items-center rounded-lg px-1.5 text-white/40 hover:text-white"
                aria-label="Cerrar"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {err && <p className="text-[11px] text-red-400">{err}</p>}
          {!err && (
            <p className="text-[11px] text-white/25">
              JPG/PNG/WebP · se comprime automático
            </p>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
