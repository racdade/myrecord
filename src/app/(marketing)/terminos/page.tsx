import type { Metadata } from "next";
import Link from "next/link";
import { EMAIL_ADMIN } from "@/lib/admin";

export const metadata: Metadata = {
  title: "Términos de servicio — Llankia",
  description: "Las reglas de uso de Llankia.",
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

export default function TerminosPage() {
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
          <h1 className="text-[40px] font-medium tracking-[-0.02em]">Términos de servicio</h1>
          <p className="text-[14px] text-[#6B6B6B]">Última actualización: {ACTUALIZADO}</p>
        </div>

        <p className="text-[15px] leading-relaxed text-[#444]">
          Estos términos explican las reglas para usar Llankia. Al crear una cuenta o usar la app,
          los aceptas. Si tienes dudas sobre algo, escríbenos antes de usar la app.
        </p>

        <Seccion titulo="1. Qué es Llankia">
          <p>
            Llankia es una herramienta para registrar tus horas de trabajo y tus horas extra, leer
            tu horario a partir de una foto o texto, ver reportes de tus horas, y —si lo activas—
            sincronizar tus turnos con Google Calendar. Si administras un equipo, también te deja
            ver las horas de sus miembros.
          </p>
        </Seccion>

        <Seccion titulo="2. Tu cuenta">
          <p>
            Entras a Llankia con tu cuenta de Google. Eres responsable de mantener el acceso a esa
            cuenta seguro; cualquier actividad que ocurra desde tu cuenta se considera hecha por
            ti. Debes darnos información real (tu nombre, correo) al usar la app.
          </p>
        </Seccion>

        <Seccion titulo="3. Uso permitido">
          <p>Al usar Llankia, te comprometes a:</p>
          <ul className="ml-5 flex list-disc flex-col gap-2">
            <li>Usar la app solo para registrar tus propias horas de trabajo (o las de tu equipo, si lo administras).</li>
            <li>No subir fotos, texto o contenido que no sea tuyo o que viole derechos de terceros.</li>
            <li>No intentar acceder a datos de otras personas sin autorización.</li>
            <li>No usar la app para actividades ilegales o para dañar su funcionamiento.</li>
          </ul>
        </Seccion>

        <Seccion titulo="4. Los cálculos de horas no son asesoría legal">
          <p>
            Llankia es una herramienta de registro personal de horas. Los cálculos de horas extra
            son referenciales y dependen de la configuración que elija cada usuario y de su
            contrato de trabajo. No constituyen asesoría legal ni laboral. Si tienes dudas sobre
            tus derechos laborales, consulta con un profesional o con la autoridad de trabajo de tu
            país.
          </p>
        </Seccion>

        <Seccion titulo="5. Tu contenido">
          <p>
            Las fotos, textos y datos que subes siguen siendo tuyos. Nos das permiso para
            procesarlos (por ejemplo, mandar la foto de tu horario a nuestro proveedor de IA para
            leerla) únicamente para darte el servicio de Llankia, según se describe en la{" "}
            <Link href="/privacidad" className="underline underline-offset-4">
              política de privacidad
            </Link>
            .
          </p>
        </Seccion>

        <Seccion titulo="6. Equipos y administradores">
          <p>
            Si creas o administras un equipo, puedes ver las horas de sus miembros e invitar o
            quitar personas. Eres responsable de tener el consentimiento de esas personas para
            administrar su información dentro de Llankia.
          </p>
        </Seccion>

        <Seccion titulo="7. Planes y pagos">
          <p>
            Llankia tiene un plan personal gratuito. El plan de administración de equipos está en
            construcción: por ahora, cualquier cobro dentro de la app es simulado y no representa
            una transacción real. Cuando el cobro sea real, estos términos se van a actualizar y te
            lo vamos a avisar antes de que se active.
          </p>
        </Seccion>

        <Seccion titulo="8. Integraciones de terceros">
          <p>
            Si conectas Google Calendar, ese servicio tiene sus propios términos, independientes de
            los nuestros. No somos responsables de cómo funcionan esos servicios externos.
          </p>
        </Seccion>

        <Seccion titulo="9. Propiedad de Llankia">
          <p>
            El nombre &ldquo;Llankia&rdquo;, el logo, el diseño y el código de la aplicación son propiedad de
            su desarrollador. No puedes copiar, revender ni distribuir la app sin permiso.
          </p>
        </Seccion>

        <Seccion titulo="10. Cancelar tu cuenta">
          <p>
            Puedes dejar de usar Llankia cuando quieras. Para borrar tu cuenta y tus datos,
            escríbenos a{" "}
            <a href={`mailto:${EMAIL_ADMIN}`} className="underline underline-offset-4">
              {EMAIL_ADMIN}
            </a>
            . También podemos suspender o cerrar una cuenta si detectamos un uso indebido de la
            app.
          </p>
        </Seccion>

        <Seccion titulo="11. Sin garantías">
          <p>
            Llankia todavía está en desarrollo activo. Hacemos lo posible para que funcione bien,
            pero la ofrecemos &ldquo;tal cual&rdquo;, sin garantizar que esté libre de errores en todo momento.
            No somos responsables por pérdidas que resulten de un mal funcionamiento de la app,
            más allá de lo que la ley exija.
          </p>
        </Seccion>

        <Seccion titulo="12. Cambios a estos términos">
          <p>
            Si hacemos cambios importantes a estos términos, lo vamos a anunciar dentro de la app.
            La fecha de arriba siempre indica la última actualización.
          </p>
        </Seccion>

        <Seccion titulo="13. Ley aplicable">
          <p>Llankia se desarrolla en Lima, Perú, y estos términos se interpretan bajo las leyes peruanas.</p>
        </Seccion>

        <Seccion titulo="14. Contacto">
          <p>
            ¿Preguntas sobre estos términos? Escríbenos a{" "}
            <a href={`mailto:${EMAIL_ADMIN}`} className="underline underline-offset-4">
              {EMAIL_ADMIN}
            </a>
            .
          </p>
        </Seccion>
      </main>

      <footer className="border-t border-[#E8E8E8] px-6 py-8 text-center">
        <p className="text-[13px] text-[#6B6B6B]">
          © {new Date().getFullYear()} Llankia. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}
