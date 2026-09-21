import { Resend } from "resend";

// Solo se usa desde el servidor (auth/callback), nunca desde el navegador.
const resend = new Resend(process.env.RESEND_API_KEY);

const REMITENTE = "Llankia <bienvenida@llankia.com>";

const LOGO_URL = "https://llankia.com/logo-email-full.png";

function htmlBienvenida(nombre: string | null): string {
  const saludo = nombre ? `Hola, ${nombre}.` : "Hola.";
  return `
    <div style="font-family: -apple-system, 'Outfit', system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #0A0A0A;">
      <img src="${LOGO_URL}" alt="Llankia" width="150" height="58" style="display: block; margin: 0 0 20px;" />
      <p style="font-size: 26px; font-weight: 600; line-height: 1.25; letter-spacing: -0.01em; margin: 0 0 20px;">
        Sube tu horario.<br />Llankia hace las cuentas.
      </p>
      <p style="font-size: 16px; margin: 0 0 20px;">${saludo} Bienvenido a Llankia.</p>
      <p style="font-size: 15px; color: #444; margin: 0 0 12px;">¿Cuántas horas trabajaste esta semana?</p>
      <p style="font-size: 15px; color: #444; margin: 0 0 12px;">¿Cuántas fueron extra?</p>
      <p style="font-size: 15px; color: #444; margin: 0 0 20px;">¿Cuánto te corresponde por ellas?</p>
      <p style="font-size: 15px; line-height: 1.6; color: #444; margin: 0 0 24px;">
        Sube la foto de tu horario o escríbelo, y Llankia te lo hace en un segundo sin que
        sumes nada a mano.
      </p>
      <a href="https://llankia.com/inicio"
         style="display: inline-block; background: #0A0A0A; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 999px; font-size: 15px; font-weight: 500;">
        Abrir Llankia
      </a>
      <p style="font-size: 15px; line-height: 1.6; color: #444; margin: 32px 0 0;">
        Gracias por confiarnos el registro de tu tiempo. Cada hora que trabajas vale, y aquí
        va a quedar siempre clara.
      </p>
      <p style="font-size: 15px; margin: 16px 0 0;">Con cariño,<br />El equipo de Llankia</p>
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
