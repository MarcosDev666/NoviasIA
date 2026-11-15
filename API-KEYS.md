# 🔑 Dónde conseguir cada API key

NoviasIA **funciona sin ninguna key**: usa el motor local de personalidades
(`lib/persona.ts`). Si querés que las respuestas las escriba un LLM de verdad, elegí
**un** proveedor de esta lista, sacá la key y pegala en `.env.local`.

> ⚠️ **Regla de oro:** la key va siempre en `.env.local` (que está en `.gitignore`).
> Nunca la commitees, nunca la pongas en el frontend.

---

## 🥇 Recomendado: Groq — rápido, gratis y sin tarjeta

**Consola:** https://console.groq.com/keys

1. Entrá a https://console.groq.com y creá la cuenta con Google, GitHub o email.
2. Verificá el email.
3. Andá a **API Keys** (https://console.groq.com/keys) → **Create API Key**.
4. Ponele un nombre (ej: `noviasia-local`) y **copiala en el momento**: no se vuelve a mostrar.
5. Pegala en `.env.local`:

```bash
GROQ_API_KEY=gsk_...
```

- La key arranca con `gsk_`.
- **No pide tarjeta.**
- Tier gratis: ~**14.400 pedidos por día** con `llama-3.1-8b-instant`, 30 por minuto.
  Es de lejos el más generoso para este proyecto.
- Modelo por defecto: `llama-3.1-8b-instant`. Podés cambiarlo con `NOVIASIA_MODEL`.

---

## 🥈 OpenRouter — un solo key para cientos de modelos

**Consola:** https://openrouter.ai/keys

1. Entrá a https://openrouter.ai y registrate (con Google/GitHub alcanza).
2. Andá a https://openrouter.ai/keys → **Create Key**.
3. Copiala (arranca con `sk-or-`).

```bash
OPENROUTER_API_KEY=sk-or-v1-...
NOVIASIA_MODEL=meta-llama/llama-3.3-70b-instruct:free
```

**Muy importante:** el modelo **tiene que terminar en `:free`**. Sin ese sufijo te cobra
créditos (y si no tenés saldo, te da error 402).

- Tier gratis: **50 pedidos por día** y 20 por minuto. Si cargás US$10 de crédito, sube a
  **1.000 por día**.
- Lista de modelos gratis: https://openrouter.ai/models?max_price=0
- Truco: podés poner `openrouter/free` como modelo y OpenRouter elige uno gratis por vos.

---

## 🥉 Cerebras — el más rápido de todos

**Consola:** https://cloud.cerebras.ai → *API Keys*

1. Registrate en https://cloud.cerebras.ai (sin tarjeta).
2. En el menú, **API Keys** → **Create API key**.
3. Copiala.

```bash
CEREBRAS_API_KEY=csk-...
```

- Tier gratis con límites de rate (alcanza para probar y para uso personal).
- Inferencia a miles de tokens por segundo: la respuesta aparece casi instantánea.
- Modelo por defecto: `llama3.1-8b`.

---

## Mistral — plan "Experiment" gratis

**Consola:** https://console.mistral.ai/api-keys

1. Cuenta en https://console.mistral.ai (la verificación pide teléfono).
2. **API Keys** → **Create new key**.
3. Copiala.

```bash
MISTRAL_API_KEY=...
```

- El plan *Experiment* es gratis y con límites de rate (bajo: ~1 request/segundo).
- Modelo por defecto: `mistral-small-latest`.
- Ojo: en el plan gratis los datos pueden usarse para mejorar el modelo salvo que lo
  desactives en la configuración.

---

## Together AI — tenés que cargar saldo

**Consola:** https://api.together.xyz/settings/api-keys

1. Cuenta en https://api.together.xyz
2. **Settings → API Keys** → **Create key**.

```bash
TOGETHER_API_KEY=...
```

- Casi siempre requiere cargar crédito (mínimo ~US$5) para que la key funcione. No es el
  camino si querés cero costo.
- Algunos modelos tienen un tier gratis limitado, pero cambia seguido.

---

## OpenAI (o cualquier API compatible)

**Consola:** https://platform.openai.com/api-keys

1. Cuenta en https://platform.openai.com
2. **API keys** → **Create new secret key**.

```bash
OPENAI_API_KEY=sk-...
# Opcional, para apuntar a otro proveedor compatible con la API de OpenAI:
# OPENAI_BASE_URL=https://mi-proxy.com/v1
```

- **Requiere cargar crédito** antes de que la key funcione. Es la opción más cara para
  este proyecto: no la necesitás para nada.

---

## Cómo saber si quedó bien configurada

```bash
npm run dev
```

En otra terminal:

```bash
curl http://localhost:3000/api/chat
```

- Si devuelve `{"engine":"local",...}` → **no está tomando ninguna key**.
  Revisá que el archivo se llame exactamente `.env.local` y esté en la raíz del proyecto.
- Si devuelve `{"engine":"groq","model":"llama-3.1-8b-instant"}` → **listo**, ya está
  usando el LLM real.

Después de editar `.env.local` **reiniciá el servidor** (Ctrl+C y `npm run dev` de nuevo):
Next no relee las variables en caliente.

El recuadro arriba del chat te muestra qué motor está activo: `motor local` o el nombre
del modelo.

---

## 🆓 ¿Y si no quiero ninguna key?

Perfecto, no hace falta. La app ya responde con el motor local de personalidades
(`lib/persona.ts`), que detecta la intención del mensaje y contesta según el personaje.
La diferencia es que las respuestas son más de "plantilla": el LLM improvisa mejor y
entiende contextos raros. Pero para probar y para la versión `noviasia.html` alcanza y
sobra.

---

## Resumen

| Proveedor | Link | ¿Tarjeta? | Gratis | Modelo por defecto |
|---|---|---|---|---|
| **Groq** ⭐ | https://console.groq.com/keys | No | ~14.400/día | `llama-3.1-8b-instant` |
| **OpenRouter** | https://openrouter.ai/keys | No | 50/día (1.000 con US$10) | `...llama-3.3-70b:free` |
| **Cerebras** | https://cloud.cerebras.ai | No | Rate limit | `llama3.1-8b` |
| **Mistral** | https://console.mistral.ai/api-keys | No (teléfono) | Plan Experiment | `mistral-small-latest` |
| **Together** | https://api.together.xyz/settings/api-keys | Sí (saldo) | Limitado | `Llama-3.3-70B-Instruct-Turbo` |
| **OpenAI** | https://platform.openai.com/api-keys | Sí (saldo) | No | `gpt-4o-mini` |

Orden de preferencia si configurás varias: **Groq → Cerebras → OpenRouter → Mistral →
Together → OpenAI**. Se puede forzar el modelo con `NOVIASIA_MODEL`.

*Los límites y URLs son de noviembre de 2026 y los proveedores los cambian seguido: si
algo no coincide, la consola del proveedor manda.*
