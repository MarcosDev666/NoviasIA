# 🔑 La API key (una sola)

NoviasIA usa **una única variable de entorno**:

```bash
NOVIASIA_API_KEY=tu_key_aca
```

Nada más. No hay seis variables, ni prioridades, ni proveedores que se pisan.

> **Si no la configurás, la app funciona igual.** Usa el motor local de personalidades
> (`lib/persona.ts`). La key sólo hace que las respuestas las escriba un LLM de verdad.

> ## 🚨 Regla número uno
>
> **La key va SOLO en `.env.local`**, que está en `.gitignore` y nunca se sube.
>
> `.env` es la plantilla del repo y va **siempre vacía**. Si pegás tu key en `.env` o en
> `.env.example` y hacés push, la key queda publicada en GitHub: cualquiera puede usarla,
> gastar tu cuota y no hay forma de "despublicarla" del historial (aunque borres el
> archivo, sigue en los commits viejos).
>
> Si te pasa: **revocá la key en la consola del proveedor y generá una nueva.** En Groq es
> https://console.groq.com/keys → 🗑 junto a la key.

---

## Paso a paso (2 minutos)

### 1. Sacá la key de Groq — gratis y sin tarjeta

1. Entrá a **https://console.groq.com** y registrate con Google, GitHub o email.
2. Verificá el email.
3. Andá a **https://console.groq.com/keys** → **Create API Key**.
4. Ponele un nombre (ej: `noviasia`) y **copiala en el momento**: no se vuelve a mostrar.
   Arranca con `gsk_`.

### 2. Creá el archivo `.env.local`

En la raíz del proyecto, un archivo llamado exactamente `.env.local` con una línea:

```bash
NOVIASIA_API_KEY=gsk_tu_key_real
```

La plantilla ya viene en el repo como **`.env`** (vacía, sin claves). Copiala y completá
el valor:

```bash
cp .env .env.local
```

> El archivo que se commitea es `.env` **sin key**. Tu key va en `.env.local`, que está
> en `.gitignore` y nunca se sube a GitHub.

### 3. Reiniciá el server

```bash
npm run dev
```

### 4. Comprobá

```bash
curl http://localhost:3000/api/chat
```

- `{"engine":"local","model":"noviasia-engine-v1"}` → no la tomó. Revisá el nombre del
  archivo (`.env.local`), que esté en la raíz y que hayas reiniciado el server.
- `{"engine":"api","model":"llama-3.1-8b-instant"}` → **listo**.

En el chat, arriba a la derecha, el recuadro muestra `motor local` o el modelo activo.

---

## ¿Querés usar otro proveedor?

Por defecto la app apunta a **Groq**. Si preferís otro, seguís usando **la misma variable**
`NOVIASIA_API_KEY` y sólo cambiás la URL y el modelo:

| Proveedor | `NOVIASIA_API_URL` | `NOVIASIA_MODEL` | Key gratis en |
|---|---|---|---|
| **Groq** (default) | `https://api.groq.com/openai/v1/chat/completions` | `llama-3.1-8b-instant` | https://console.groq.com/keys |
| OpenRouter | `https://openrouter.ai/api/v1/chat/completions` | `meta-llama/llama-3.3-70b-instruct:free` | https://openrouter.ai/keys |
| Cerebras | `https://api.cerebras.ai/v1/chat/completions` | `llama3.1-8b` | https://cloud.cerebras.ai |
| Mistral | `https://api.mistral.ai/v1/chat/completions` | `mistral-small-latest` | https://console.mistral.ai/api-keys |
| OpenAI | `https://api.openai.com/v1/chat/completions` | `gpt-4o-mini` | https://platform.openai.com/api-keys |

Ejemplo con OpenRouter:

```bash
NOVIASIA_API_KEY=sk-or-v1-...
NOVIASIA_API_URL=https://openrouter.ai/api/v1/chat/completions
NOVIASIA_MODEL=meta-llama/llama-3.3-70b-instruct:free
```

> En OpenRouter el modelo **tiene que terminar en `:free`**, si no te cobra créditos
> (y sin saldo te da error 402).

¿Un proveedor que no está en la lista? Si habla el formato de OpenAI
(`POST /chat/completions` con `choices[0].message.content`), funciona: poné su URL.

---

## Qué pasa si la key es inválida o se cae la red

La app **no se rompe**: detecta el error y contesta con el motor local. Probado con keys
falsas (`gsk_fake`) → devuelve `{"reply":"...","source":"local"}`.

---

## Resumen

| | |
|---|---|
| Variable | `NOVIASIA_API_KEY` |
| Obligatoria | No |
| Dónde va | `.env.local` |
| Proveedor por defecto | Groq (`llama-3.1-8b-instant`) |
| Costo | $0, sin tarjeta |
| Límite gratis | ~14.400 pedidos/día |

*Los límites y URLs son de noviembre de 2026 y los proveedores los cambian seguido: si
algo no coincide, la consola del proveedor manda.*
