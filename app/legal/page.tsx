import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = { title: "Términos y privacidad — NoviasIA" };

export default function LegalPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Términos y privacidad</h1>
        <p className="mt-2 text-sm text-white/45">
          Última actualización: {new Date().getFullYear()}
        </p>

        <div className="mt-8 space-y-8 text-[14px] leading-relaxed text-white/60">
          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">1. Qué es NoviasIA</h2>
            <p>
              NoviasIA es un proyecto de demostración de chats con personajes generados por
              inteligencia artificial. Todos los personajes, nombres, historias y
              personalidades son ficción. Ningún personaje representa a una persona real,
              viva o muerta.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">2. Contenido generado</h2>
            <p>
              Las respuestas pueden ser inexactas, absurdas, exageradas o dramáticas a
              propósito: es parte del personaje. No uses lo que te dicen como consejo
              médico, legal, psicológico ni financiero. Para eso están los profesionales de
              verdad (y cobran, pero al menos saben).
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">3. Uso responsable</h2>
            <p>
              Está pensado como entretenimiento para mayores de 13 años. No está permitido
              usarlo para acosar, suplantar identidades, generar contenido ilegal o intentar
              extraer información personal de terceros. Los personajes "celosos" o "tóxicos"
              son una parodia: si alguien te trata así de verdad, eso no es amor.
            </p>
          </section>

          <section id="privacidad">
            <h2 className="mb-2 text-lg font-semibold text-white">4. Privacidad</h2>
            <p>
              Tus chats, tu nombre y los personajes que creás se guardan únicamente en el
              almacenamiento local de tu navegador (<code className="rounded bg-white/10 px-1">localStorage</code>).
              No hay cuentas, no hay base de datos de usuarios y no vendemos nada a nadie.
              Si borrás los datos del navegador, se borra todo.
            </p>
            <p className="mt-3">
              Los mensajes que enviás pasan por el servidor de la app para generar la
              respuesta y, si el operador configuró un proveedor de modelos de lenguaje,
              pueden enviarse a ese proveedor para producir el texto. No se guardan en el
              servidor.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">5. Salud mental</h2>
            <p>
              Esto no reemplaza a nadie. Si estás pasando un momento difícil, hablá con
              alguien real: un amigo, tu familia o un profesional. En Argentina podés llamar
              al 135 (Centro de Asistencia al Suicida) o al 107 (SAME).
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">6. Cambios</h2>
            <p>
              Esto es un proyecto abierto, así que estas condiciones pueden cambiar sin
              aviso. Si volvés y es distinto, bueno, es culpa del commit.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
