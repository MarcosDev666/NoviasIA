# NoviasIA 💅🔥

Una web de chatbots al estilo [character.ai](https://character.ai), pero con personajes
bien argentinos: turras del conurbano, novias celosas, tóxicas con onda, amigas del alma,
gente re gila y personajes de todo el mundo.

**Todos los personajes son ficción. Nada de esto es gente real.**

---

## ✨ Qué tiene

- 🎭 **16 personajes** listos para chatear (argentinos + internacionales)
- 💬 **Chat funcional de verdad**: mensajes guardados, historial, "escribiendo…", delay humano
- 🧠 **Motor de personalidades propio**: detecta intención (amor, celos, insulto, excusa, comida, plan, tristeza…) y responde según los rasgos del personaje
- 🔌 **IA real opcional**: si configurás una API key, las respuestas las genera un LLM manteniendo el personaje (fallback automático al motor local)
- 🎨 **Creá tu propio personaje**: nombre, personalidad, saludo, emojis, colores y 5 sliders de rasgos (celos, toxicidad, cariño, humor, intensidad) con vista previa en vivo
- 🔍 **Explorar** con buscador + filtros por estilo
- 📱 **Responsive** y mobile-first
- 🗄️ **Sin base de datos ni cuentas**: todo se guarda en `localStorage`

## 🌐 Verla en HTML (la forma más rápida)

Hay **dos formas** de ver la web:

### 1. Un solo archivo HTML (sin instalar nada) ⭐

**[`noviasia.html`](./noviasia.html)** — abrila con doble clic en cualquier navegador.
Es la app completa (16 personajes, chat, creador, perfil) en un único archivo de ~104 KB,
sin servidor, sin build, sin dependencias. Funciona offline, incluso desde una URL `file://`.

También está publicada como [`public/noviasia.html`](./public/noviasia.html), así que si
corrés la app Next queda disponible en `http://localhost:3000/noviasia.html`.

Para regenerarla después de tocar los personajes:

```bash
npm run build:html
```

### 2. La app Next.js completa

```bash
npm install
npm run dev
```

## 🚀 Correrlo

Abrí [http://localhost:3000](http://localhost:3000).

> Funciona out of the box, sin ninguna API key. El motor local de personalidades se
> encarga de que los chats respondan igual.

### Con IA real (opcional)

Copiá `.env.example` a `.env.local` y poné **una** de estas claves (links y paso a paso
en **[API-KEYS.md](./API-KEYS.md)**):

| Proveedor | Dónde sacarla | ¿Tarjeta? | Gratis | Variable |
|---|---|---|---|---|
| **Groq** ⭐ | [console.groq.com/keys](https://console.groq.com/keys) | No | ~14.400/día | `GROQ_API_KEY` |
| **OpenRouter** | [openrouter.ai/keys](https://openrouter.ai/keys) | No | 50/día | `OPENROUTER_API_KEY` |
| **Cerebras** | [cloud.cerebras.ai](https://cloud.cerebras.ai) | No | rate limit | `CEREBRAS_API_KEY` |
| **Mistral** | [console.mistral.ai/api-keys](https://console.mistral.ai/api-keys) | No | Plan Experiment | `MISTRAL_API_KEY` |
| **Together** | [api.together.xyz/settings/api-keys](https://api.together.xyz/settings/api-keys) | Sí | Limitado | `TOGETHER_API_KEY` |
| **OpenAI** | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) | Sí | No | `OPENAI_API_KEY` |

Orden de preferencia si configurás varias: Groq → Cerebras → OpenRouter → Mistral →
Together → OpenAI. Podés forzar el modelo con `NOVIASIA_MODEL`.

Verificá qué motor está activo con `curl localhost:3000/api/chat`. Si el proveedor falla
o se cae la red, la app vuelve sola al motor local: nunca te quedás sin respuesta.

## 🗂️ Estructura

```
app/
  page.tsx              Landing: hero, tendencias, buscador y filtros
  chat/[id]/page.tsx    Chat (la parte importante)
  chats/page.tsx        Historial de conversaciones
  crear/page.tsx        Creador de personajes
  perfil/page.tsx       Perfil, tus personajes y borrado de datos
  legal/page.tsx        Términos, privacidad y salud mental
  api/chat/route.ts     API: LLM real con fallback al motor local
standalone/
  template.html         Plantilla del HTML autónomo
scripts/
  build-standalone.ts   Genera noviasia.html con los 16 personajes
noviasia.html           ⭐ La app entera en un archivo: abrilo con doble clic
components/             Navbar, tarjetas, avatar, chat, creador…
lib/
  characters.ts         Los 17 personajes y sus personalidades
  persona.ts            Motor de personalidades (intents + vocabulario por personaje)
  store.ts              Persistencia en localStorage
  types.ts              Tipos y estilos (vibes)
```

## 🧠 Cómo funciona el motor local

1. Normaliza el texto y detecta la **intención** del mensaje (`love`, `insult`, `apology`,
   `excuse`, `jealousy_check`, `food`, `plan`, `sad`, `bored`…).
2. Elige una **reacción** acorde a esa intención y al **estilo del personaje** (turra,
   celosa, tóxica, amiga, re gila, romántica, caótica, maternal, internacional).
3. Construye el cuerpo según sus **rasgos numéricos** (los celos altos agregan sospechas,
   la toxicidad agrega culpa, el cariño agrega ternura).
4. Agrega un cierre (pregunta o remate) evitando repetir frases recientes.

Es determinístico en estructura y aleatorio en superficie: nunca te contesta exactamente
lo mismo dos veces seguidas.

## ⚠️ Sobre el contenido

Los personajes "celosos" y "tóxicos" son **parodia**. La app incluye avisos y una sección
de salud mental. Si alguien te trata así de verdad, eso no es amor.

## 📄 Licencia

MIT. Hacé lo que quieras, pero no le eches la culpa a la IA.
