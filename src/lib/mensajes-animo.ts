import { toZonedTime } from "date-fns-tz";

const ZONA_HORARIA = "America/Lima";

// 40 aperturas × 25 cierres = 1000 combinaciones posibles.
const APERTURAS = [
  "Que tengas un día tranquilo.",
  "Hoy es un buen día para empezar bien.",
  "Respira hondo antes de arrancar la jornada.",
  "Un nuevo día, una nueva oportunidad.",
  "Que el día te trate con calma.",
  "Vamos con buena energía hoy.",
  "Cada día suma, aunque no lo notes.",
  "Que tengas un turno llevadero.",
  "Hoy también cuenta, y mucho.",
  "Un paso a la vez, así se construye todo.",
  "Que el café (o el té) te acompañe bien hoy.",
  "Ojalá el día te sonría un poco.",
  "Ánimo, hoy también se puede.",
  "Que la jornada fluya sin sobresaltos.",
  "Un buen día empieza con una buena actitud.",
  "Hoy es una buena oportunidad para avanzar.",
  "Que tengas la calma que necesitas hoy.",
  "Sigue a tu ritmo, no hay apuro.",
  "Hoy vale la pena, como cada día.",
  "Que el trabajo de hoy se sienta liviano.",
  "Un gesto amable hoy puede cambiarle el día a alguien.",
  "Que tengas energía de sobra para lo que viene.",
  "El esfuerzo de hoy no se pierde.",
  "Buenos días — que empiece bien la jornada.",
  "Que el día te encuentre de buen humor.",
  "Hoy es un buen momento para cuidar de ti también.",
  "Que las horas de hoy pasen tranquilas.",
  "Todo lo que haces hoy suma para lo que viene.",
  "Que tengas claridad en lo que te propongas hoy.",
  "Un poco de paciencia hoy rinde mucho.",
  "Que el día rinda tanto como tú.",
  "Vas bien, sigue así.",
  "Que hoy sea un día liviano de llevar.",
  "El trabajo constante siempre da frutos.",
  "Que tengas un buen equilibrio hoy entre esfuerzo y descanso.",
  "Hoy también mereces un buen día.",
  "Que la jornada te resulte justa y tranquila.",
  "Un día más, un paso más cerca de tus metas.",
  "Que te acompañe la buena disposición hoy.",
  "Buen día — que todo fluya como corresponde.",
] as const;

const CIERRES = [
  "Recuerda tomar tus descansos cuando los necesites.",
  "No olvides estirar un poco si pasas muchas horas de pie o sentado.",
  "Hidrátate durante la jornada.",
  "Un buen turno también incluye cuidar de ti mismo.",
  "Si te cansas, está bien hacer una pausa.",
  "Registra tus horas con calma, no hay apuro.",
  "El descanso también es parte del trabajo bien hecho.",
  "Cuida tu espalda y tu postura durante el día.",
  "Comer bien también rinde en el trabajo.",
  "Un pequeño descanso a media jornada ayuda más de lo que parece.",
  "No te olvides de avisar si necesitas ayuda con algo.",
  "Cada turno bien registrado te ayuda a ti mismo después.",
  "El orden de hoy te ahorra tiempo mañana.",
  "Vale la pena anotar las cosas a tiempo.",
  "Un turno bien planificado se disfruta más.",
  "Recuerda que también puedes pedir un cambio si lo necesitas.",
  "Cuida tus horas de sueño esta semana.",
  "El descanso del fin de semana también se gana trabajando bien.",
  "Un buen equipo se nota en los pequeños detalles.",
  "Gracias por el esfuerzo de cada semana.",
  "Tu trabajo, aunque no lo veas, hace una diferencia.",
  "Cuida de ti tanto como cuidas de tu trabajo.",
  "No hay turno tan largo que no termine.",
  "Cada hora registrada es un paso más cerca de tus metas.",
  "Gracias por estar aquí hoy.",
] as const;

const MENSAJES_CUMPLEANOS = [
  "¡Feliz cumpleaños! Que tengas un día tan bueno como te mereces.",
  "¡Feliz cumpleaños! Ojalá se te cumpla algo importante este nuevo año.",
  "Hoy es tu día — ¡feliz cumpleaños!",
  "¡Feliz cumpleaños! Que este nuevo año te traiga cosas buenas.",
  "Un año más, un motivo más para celebrar. ¡Feliz cumpleaños!",
  "¡Feliz cumpleaños! Que hoy sea especialmente liviano de llevar.",
  "¡Feliz cumpleaños! Esperamos que lo disfrutes mucho.",
] as const;

/** Combina una apertura y un cierre al azar: 40 × 25 = 1000 mensajes posibles. */
export function mensajeAlAzar(): string {
  const apertura = APERTURAS[Math.floor(Math.random() * APERTURAS.length)];
  const cierre = CIERRES[Math.floor(Math.random() * CIERRES.length)];
  return `${apertura} ${cierre}`;
}

export function mensajeCumpleanos(): string {
  return MENSAJES_CUMPLEANOS[Math.floor(Math.random() * MENSAJES_CUMPLEANOS.length)];
}

/**
 * ¿Hoy (en America/Lima) es el cumpleaños de la persona? Compara solo mes y
 * día, no el año.
 */
export function esCumpleanosHoy(fechaNacimientoISO: string | null | undefined, ahora: Date = new Date()): boolean {
  if (!fechaNacimientoISO) return false;

  const [, mesStr, diaStr] = fechaNacimientoISO.split("-");
  const mesNacimiento = Number(mesStr);
  const diaNacimiento = Number(diaStr);
  if (!mesNacimiento || !diaNacimiento) return false;

  const hoyLima = toZonedTime(ahora, ZONA_HORARIA);
  return hoyLima.getMonth() + 1 === mesNacimiento && hoyLima.getDate() === diaNacimiento;
}
