import type { Metadata } from "next";
import Link from "next/link";
import { EMAIL_ADMIN } from "@/lib/admin";

export const metadata: Metadata = {
  title: "Política de privacidad — Llankia",
  description: "Cómo Llankia recopila, usa y protege tus datos.",
};

const ACTUALIZADO = "21 de septiembre de 2026";

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-[22px] font-medium tracking-[-0.01em] text-[#0A0A0A]">{titulo}</h2>
      <div className="flex flex-col gap-3 text-[15px] leading-relaxed text-[#444]">{children}</div>
    </section>
  );
}

export default function PrivacidadPage() {
  return (
    <div className="bg-white text-[#0A0A0A]">
      <header className="border-b border-[#E8E8E8]">
        <div className="mx-auto flex max-w-[720px] items-center justify-between px-6 py-5">
          <Link href="/" className="text-[15px] font-medium">
            Llankia
          </Link>
          <Link href="/" className="text-[14px] text-[#6B6B6B] transition-opacity hover:opacity-60">
            Volver al inicio
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-[720px] flex-col gap-10 px-6 py-16">
        <div className="flex flex-col gap-2">
          <h1 className="text-[40px] font-medium tracking-[-0.02em]">Política de privacidad</h1>
          <p className="text-[14px] text-[#6B6B6B]">Última actualización: {ACTUALIZADO}</p>
        </div>

        <p className="text-[15px] leading-relaxed text-[#444]">
          Llankia es una app para registrar horas de trabajo y horas extra. Esta política explica
          qué datos recopilamos, para qué los usamos, con quién los compartimos y cómo puedes
          controlarlos. La escribimos para que se entienda de verdad, no para llenar espacio.
        </p>

        <Seccion titulo="1. Quién es responsable de tus datos">
          <p>
            Llankia es operada por su desarrollador, con contacto en{" "}
            <a href={`mailto:${EMAIL_ADMIN}`} className="underline underline-offset-4">
              {EMAIL_ADMIN}
            </a>
            . Cualquier consulta sobre tus datos o esta política puedes escribirla ahí.
          </p>
        </Seccion>

        <Seccion titulo="2. Qué datos recopilamos">
          <p>
            <strong>De tu cuenta:</strong> nombre, correo electrónico y foto de perfil, que
            obtenemos de Google cuando inicias sesión.
          </p>
          <p>
            <strong>De tu perfil:</strong> fecha de nacimiento (opcional, solo para saludarte en tu
            cumpleaños), tarifa por hora, moneda, zona horaria, idioma y formato de hora que
            elijas.
          </p>
          <p>
            <strong>De tus horas de trabajo:</strong> los turnos que registras (fecha, horario,
            tipo, notas) y, si subes una foto o texto de tu horario para que la IA lo lea, esa foto
            o texto y los turnos que resultan de leerla.
          </p>
          <p>
            <strong>De Google Calendar:</strong> si decides conectar tu cuenta, guardamos un token
            de acceso cifrado para crear y actualizar eventos en tu calendario con tus turnos. No
            leemos el resto de tu calendario.
          </p>
          <p>
            <strong>De equipos:</strong> si administras o perteneces a un equipo, el nombre del
            equipo, quién lo integra y las horas de sus miembros (visibles solo para el
            administrador del equipo).
          </p>
        </Seccion>

        <Seccion titulo="3. Para qué usamos tus datos">
          <ul className="ml-5 flex list-disc flex-col gap-2">
            <li>Calcular tus horas trabajadas, horas extra y pago estimado.</li>
            <li>Leer la foto o el texto de tu horario y convertirlo en turnos (con IA).</li>
            <li>Sincronizar tus turnos con Google Calendar, si lo activaste.</li>
            <li>Mostrarte reportes y tendencias de tus horas.</li>
            <li>
              Si administras un equipo, mostrarte las horas de sus miembros y gestionar la
              facturación del plan.
            </li>
            <li>Mandarte el correo de bienvenida cuando te registras.</li>
            <li>Notificarte dentro de la app si el equipo de Llankia te responde un mensaje.</li>
          </ul>
          <p>No usamos tus datos para publicidad, ni los vendemos a nadie.</p>
        </Seccion>

        <Seccion titulo="4. Con quién compartimos datos">
          <p>
            No compartimos tus datos con terceros para sus propios fines. Sí usamos estos
            proveedores para que Llankia funcione, cada uno procesando solo lo necesario para su
            función:
          </p>
          <ul className="ml-5 flex list-disc flex-col gap-2">
            <li>
              <strong>Supabase</strong> — base de datos, autenticación y almacenamiento de fotos.
            </li>
            <li>
              <strong>Google</strong> — inicio de sesión y sincronización con Google Calendar,
              según lo que tú autorices.
            </li>
            <li>
              <strong>Anthropic (Claude)</strong> — lee la foto o el texto de tu horario para
              convertirlo en turnos. Esas fotos no se usan para entrenar modelos de IA.
            </li>
            <li>
              <strong>Resend</strong> — envía el correo de bienvenida.
            </li>
            <li>
              <strong>Vercel</strong> — aloja la aplicación.
            </li>
          </ul>
        </Seccion>

        <Seccion titulo="5. Uso de datos de Google">
          <p>
            El uso y la transferencia a cualquier otra aplicación de la información que Llankia
            reciba desde las APIs de Google se ajustará a la{" "}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              Política de Datos de Usuario de los Servicios de API de Google
            </a>
            , incluidos los requisitos de Uso Limitado.
          </p>
        </Seccion>

        <Seccion titulo="6. Fotos de horarios">
          <p>
            Las fotos que subes para registrar tu horario se guardan en un almacenamiento privado:
            solo tú puedes verlas. Se usan únicamente para que la IA lea tu horario; puedes
            borrarlas cuando quieras.
          </p>
        </Seccion>

        <Seccion titulo="7. Cuánto tiempo guardamos tus datos">
          <p>
            Guardamos tus datos mientras tu cuenta esté activa. Si quieres borrar tu cuenta y toda
            tu información, escríbenos a{" "}
            <a href={`mailto:${EMAIL_ADMIN}`} className="underline underline-offset-4">
              {EMAIL_ADMIN}
            </a>{" "}
            y lo hacemos en un plazo razonable. Estamos trabajando en que puedas hacerlo tú mismo
            desde la app.
          </p>
        </Seccion>

        <Seccion titulo="8. Seguridad">
          <p>
            Cada persona solo puede ver y modificar sus propios datos (turnos, fotos, perfil); un
            administrador de equipo solo ve los datos de su equipo. Esto se aplica directamente en
            la base de datos, no solo escondiendo botones en la pantalla. El token de Google
            Calendar se guarda cifrado.
          </p>
        </Seccion>

        <Seccion titulo="9. Tus derechos">
          <p>
            Puedes pedirnos acceder a tus datos, corregirlos o borrarlos en cualquier momento,
            escribiendo a{" "}
            <a href={`mailto:${EMAIL_ADMIN}`} className="underline underline-offset-4">
              {EMAIL_ADMIN}
            </a>
            . También puedes desconectar Google Calendar desde el Dashboard cuando quieras.
          </p>
        </Seccion>

        <Seccion titulo="10. Menores de edad">
          <p>Llankia no está dirigida a menores de 13 años, y no recopilamos datos a sabiendas de ellos.</p>
        </Seccion>

        <Seccion titulo="11. Cambios a esta política">
          <p>
            Si cambiamos esta política de forma importante, lo vamos a anunciar dentro de la app.
            La fecha de arriba siempre indica la última actualización.
          </p>
        </Seccion>

        <Seccion titulo="12. Contacto">
          <p>
            ¿Preguntas sobre tus datos o esta política? Escríbenos a{" "}
            <a href={`mailto:${EMAIL_ADMIN}`} className="underline underline-offset-4">
              {EMAIL_ADMIN}
            </a>
            .
          </p>
        </Seccion>
      </main>

      <footer className="border-t border-[#E8E8E8] px-6 py-8 text-center">
        <p className="text-[13px] text-[#6B6B6B]">Llankia · Tus horas, claras.</p>
      </footer>
    </div>
  );
}
