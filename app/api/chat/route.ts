import { NextResponse } from "next/server";
import { CHARACTERS } from "@/lib/characters";
import { buildSystemPrompt, generateReply } from "@/lib/persona";
import type { Character, Message } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  character?: Character;
  characterId?: string;
  messages?: Pick<Message, "role" | "content">[];
  userName?: string;
};

/**
 * Una sola API key para toda la app: NOVIASIA_API_KEY.
 *
 * Habla el formato OpenAI, así que sirve con el proveedor que quieras:
 * Groq, OpenRouter, Cerebras, Mistral, Together u OpenAI.
 * Lo único que hay que tocar es NOVIASIA_API_URL y NOVIASIA_MODEL.
 */
const DEFAULT_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.1-8b-instant";

type Provider = {
  url: string;
  key: string;
  model: string;
};

function resolveProvider(): Provider | null {
  const key = (process.env.NOVIASIA_API_KEY || "").trim();
  if (!key) return null;

  return {
    key,
    url: (process.env.NOVIASIA_API_URL || DEFAULT_URL).trim(),
    model: (process.env.NOVIASIA_MODEL || DEFAULT_MODEL).trim(),
  };
}

function fallback(character: Character, messages: Pick<Message, "role" | "content">[]) {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const text = lastUser?.content ?? "";
  const history = messages.map((m, i) => ({
    id: String(i),
    role: m.role,
    content: m.content,
    createdAt: 0,
  })) as Message[];
  return generateReply(character, text, history);
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const character =
    body.character ||
    CHARACTERS.find((c) => c.id === body.characterId) ||
    CHARACTERS[0];

  const messages = Array.isArray(body.messages) ? body.messages.slice(-30) : [];
  if (!messages.length) {
    return NextResponse.json({ error: "Faltan mensajes" }, { status: 400 });
  }

  const provider = resolveProvider();

  if (!provider) {
    return NextResponse.json({ reply: fallback(character, messages), source: "local" });
  }

  const system = [
    buildSystemPrompt(character),
    body.userName ? `El usuario se llama ${body.userName}.` : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const res = await fetch(provider.url, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${provider.key}`,
      },
      body: JSON.stringify({
        model: provider.model,
        temperature: 0.95,
        max_tokens: 280,
        presence_penalty: 0.4,
        frequency_penalty: 0.3,
        messages: [
          { role: "system", content: system },
          ...messages.map((m) => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content: m.content,
          })),
        ],
      }),
    });

    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json({ reply: fallback(character, messages), source: "local" });
    }

    const data = await res.json();
    const reply: string | undefined = data?.choices?.[0]?.message?.content;
    if (!reply || !reply.trim()) {
      return NextResponse.json({ reply: fallback(character, messages), source: "local" });
    }
    return NextResponse.json({
      reply: reply.trim().slice(0, 1200),
      source: "api",
    });
  } catch {
    return NextResponse.json({ reply: fallback(character, messages), source: "local" });
  }
}

export async function GET() {
  const provider = resolveProvider();
  return NextResponse.json({
    engine: provider ? "api" : "local",
    model: provider?.model ?? "noviasia-engine-v1",
  });
}
