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

type Provider = {
  url: string;
  key: string;
  model: string;
  label: string;
};

/**
 * Orden de preferencia. El primero que tenga clave configurada gana.
 * Todos los proveedores de la lista hablan el formato OpenAI, así que
 * sólo cambia la URL y el modelo por defecto.
 */
function resolveProvider(): Provider | null {
  const pick = (envKey: string, model: string): string | undefined =>
    process.env[envKey] ? process.env.NOVIASIA_MODEL || model : undefined;

  if (process.env.GROQ_API_KEY) {
    return {
      url: "https://api.groq.com/openai/v1/chat/completions",
      key: process.env.GROQ_API_KEY,
      // Tier gratis generoso: 14.400 pedidos/día y rapidísimo.
      model: pick("GROQ_API_KEY", "llama-3.1-8b-instant")!,
      label: "groq",
    };
  }

  if (process.env.CEREBRAS_API_KEY) {
    return {
      url: "https://api.cerebras.ai/v1/chat/completions",
      key: process.env.CEREBRAS_API_KEY,
      model: pick("CEREBRAS_API_KEY", "llama3.1-8b")!,
      label: "cerebras",
    };
  }

  if (process.env.OPENROUTER_API_KEY) {
    return {
      url: "https://openrouter.ai/api/v1/chat/completions",
      key: process.env.OPENROUTER_API_KEY,
      // OJO: tiene que terminar en ":free" o te cobra créditos.
      model: pick("OPENROUTER_API_KEY", "meta-llama/llama-3.3-70b-instruct:free")!,
      label: "openrouter",
    };
  }

  if (process.env.MISTRAL_API_KEY) {
    return {
      url: "https://api.mistral.ai/v1/chat/completions",
      key: process.env.MISTRAL_API_KEY,
      model: pick("MISTRAL_API_KEY", "mistral-small-latest")!,
      label: "mistral",
    };
  }

  if (process.env.TOGETHER_API_KEY) {
    return {
      url: "https://api.together.xyz/v1/chat/completions",
      key: process.env.TOGETHER_API_KEY,
      model: pick("TOGETHER_API_KEY", "meta-llama/Llama-3.3-70B-Instruct-Turbo")!,
      label: "together",
    };
  }

  if (process.env.OPENAI_API_KEY) {
    const base = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
    return {
      url: `${base.replace(/\/$/, "")}/chat/completions`,
      key: process.env.OPENAI_API_KEY,
      model: pick("OPENAI_API_KEY", "gpt-4o-mini")!,
      label: "openai",
    };
  }

  return null;
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
      source: provider.label,
    });
  } catch {
    return NextResponse.json({ reply: fallback(character, messages), source: "local" });
  }
}

export async function GET() {
  const provider = resolveProvider();
  return NextResponse.json({
    engine: provider ? provider.label : "local",
    model: provider?.model ?? "noviasia-engine-v1",
  });
}
