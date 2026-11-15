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
- 🎬 **Motor de rol**: las respuestas vienen en formato `*acción*` + `Nombre: texto`, como en character.ai
- 💞 **Entiende la intensidad**: "te rreee amooo!!!" recibe una respuesta mucho más efusiva que "te amo"
- 🖼️ **Imágenes por personaje**: foto de perfil y fondo, subiendo archivo o pegando un link (se comprimen solas)
- 🎨 **Creá tu propio personaje**: rol, personalidad, saludo, escenas, muletillas, cómo te llama, nivel de emojis, emojis, colores y 5 sliders de rasgos (celos, toxicidad, cariño, humor, intensidad) con vista previa en vivo
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

### Con IA real (opcional) — una sola key

Creá un `.env.local` (la plantilla está en `.env`) y completá **una única variable**:

```bash
cp .env .env.local   # y pegá tu key en NOVIASIA_API_KEY
```

```bash
NOVIASIA_API_KEY=gsk_tu_key_aca
```

La key la sacás gratis (sin tarjeta) en **https://console.groq.com/keys**.
Paso a paso completo en **[API-KEYS.md](./API-KEYS.md)**.

Por defecto la app apunta a Groq (`llama-3.1-8b-instant`). Si querés otro proveedor, seguís
usando la misma variable y sólo agregás dos opcionales:

```bash
NOVIASIA_API_URL=https://openrouter.ai/api/v1/chat/completions
NOVIASIA_MODEL=meta-llama/llama-3.3-70b-instruct:free
```

Verificá qué motor está activo con `curl localhost:3000/api/chat`. Si la key es inválida o
se cae la red, la app vuelve sola al motor local: nunca te quedás sin respuesta.

Sin ninguna key configurada funciona igual, con el motor local de personalidades.

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
  roleplay.ts           Formato de rol (*acciones*), intensidad emocional y parser de burbujas
  store.ts              Persistencia en localStorage
  types.ts              Tipos y estilos (vibes)
```

## 🎬 El formato de rol

Cada respuesta del personaje llega así:

```
*rocio se pone colorada y aparta la vista*
Rocio: te amo wachin, te amo todo ❤️
```

La primera línea es la **acción** (se muestra en cursiva y gris) y la segunda el
**diálogo** (con el nombre del personaje en negrita). En el chat se ve como en
character.ai: la acción arriba en chiquito e itálica, la burbuja abajo.

**Intensidad emocional:** el motor detecta mayúsculas, letras repetidas y signos:

| Vos escribís | Detecta | Respuesta |
|---|---|---|
| `te amo` | normal | normal |
| `Te rreee amo Ma,` | intensidad 1 | más efusiva |
| `TE AMOOOO!!!` | intensidad 3 | remata con "te amo posta, me dejás sin palabras" |

**Por personaje podés definir:** rol (`tu mejor amiga`), escenas propias, muletillas,
cómo te llama, si narra acciones y cuántos emojis usa.

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
