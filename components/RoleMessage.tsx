"use client";

import { stripRoleFormat } from "@/lib/roleplay";
import Avatar from "./Avatar";
import type { Character } from "@/lib/types";

/**
 * Burbuja con formato de rol:
 *   *acción en cursiva*
 *   Nombre: el texto
 */
export default function RoleMessage({
  content,
  character,
  me = false,
  userEmoji = "🫥",
  dense = false,
}: {
  content: string;
  character?: Character;
  me?: boolean;
  userEmoji?: string;
  dense?: boolean;
}) {
  const { action, text } = stripRoleFormat(content);

  return (
    <div className={`flex flex-col ${me ? "items-end" : "items-start"}`}>
      {action && (
        <p
          className={`mb-1 max-w-full px-1 text-[12.5px] italic leading-snug text-white/45 ${
            me ? "text-right" : "text-left"
          }`}
        >
          *{action}*
        </p>
      )}

      <div
        className={`whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2.5 leading-relaxed ${
          dense ? "text-[14px]" : "text-[14.5px]"
        } ${
          me
            ? "rounded-tr-sm bg-gradient-to-br from-hot-500 to-hot-600 text-white"
            : "rounded-tl-sm border border-white/[0.07] bg-ink-800/90 text-white/90"
        }`}
      >
        {!me && character && (
          <span className="mr-1.5 font-semibold text-white/95">{character.name}:</span>
        )}
        {text}
      </div>
    </div>
  );
}

export { Avatar };
