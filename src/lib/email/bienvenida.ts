import { Resend } from "resend";

// Solo se usa desde el servidor (auth/callback), nunca desde el navegador.
const resend = new Resend(process.env.RESEND_API_KEY);

const REMITENTE = "Llankia <onboarding@resend.dev>";

function htmlBienvenida(nombre: string | null): string {
  const saludo = nombre ? `Hola, ${nombre}` : "Hola";
  return `
    <div style="font-family: -apple-system, 'Outfit', system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #0A0A0A;">
      <p style="font-size: 20px; font-weight: 600; letter-spacing: 0.02em; margin: 0 0 24px;">Llankia</p>
      <p style="font-size: 17px; margin: 0 0 12px;">${saludo}, ¡bienvenido a Llankia!</p>
      <p style="font-size: 15px; line-height: 1.6; color: #444; margin: 0 0 16px;">
        Gracias por registrarte. Llankia viene de <em>llank'ay</em>, "trabajar" en quechua:
        tu trabajo vale, y tus horas merecen quedar registradas.
      </p>
      <p style="font-size: 15px; line-height: 1.6; color: #444; margin: 0 0 24px;">
        Sube la foto de tu horario o escríbelo, y Llankia se encarga de calcular tus horas
        y tus extras por ti.
      </p>
      <a href="https://llankia.vercel.app/inicio"
         style="display: inline-block; background: #0A0A0A; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 999px; font-size: 15px; font-weight: 500;">
        Abrir Llankia
      </a>
      <p style="font-size: 12px; color: #999; margin: 32px 0 0;">Llankia · Tus horas, claras.</p>
    </div>
  `;
}

export async function enviarCorreoBienvenida(destinatario: string, nombre: string | null): Promise<void> {
  const { error } = await resend.emails.send({
    from: REMITENTE,
    to: destinatario,
    subject: "¡Bienvenido a Llankia!",
    html: htmlBienvenida(nombre),
  });
  if (error) {
    console.error("[email] No se pudo enviar el correo de bienvenida:", error.message);
  }
}
