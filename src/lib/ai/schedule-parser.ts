import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { horarioExtraidoSchema, type TurnoPropuesto } from "@/lib/validations/schedule-import";

/**
 * Lee horarios de trabajo (foto o texto) y los convierte en turnos.
 * Server-only: solo se importa desde Server Actions (nunca desde el navegador).
 */

const client = new Anthropic();

const MODELO = "claude-opus-5";

function instrucciones(semanaInicioISO: string, nombrePersona?: string): string {
  const filtroPersona = nombrePersona
    ? `\n- El horario puede tener turnos de varias personas. Devuelve SOLO los turnos de "${nombrePersona}" (columna, fila o bloque con ese nombre); ignora por completo los turnos de cualquier otra persona.`
    : "";

  return `Eres un asistente que convierte horarios de trabajo (en foto o texto) en una lista de turnos.

Reglas:
- Zona horaria: America/Lima. Las horas van en formato 24 horas "HH:MM".
- "tipo" es "libre" para días sin turno, "feriado" solo si el horario original lo marca explícitamente como feriado, y "normal" para el resto.
- Si "tipo" es "libre", "horaInicio" y "horaFin" deben ser null.
- "descansoMin" es el descanso en minutos; usa 0 si no se menciona ningún descanso.
- El lunes de la semana de referencia es ${semanaInicioISO}. Resuelve nombres de días (lunes, martes, ...) a la fecha real de esa semana.
- Si el horario menciona una fecha explícita en vez de un día de la semana, respeta esa fecha en vez de la semana de referencia.
- No inventes turnos: si no puedes leer un dato con confianza razonable, omite esa fila en vez de adivinar.${filtroPersona}`;
}

export async function interpretarHorarioTexto(
  texto: string,
  semanaInicioISO: string,
  nombrePersona?: string,
): Promise<TurnoPropuesto[]> {
  const response = await client.messages.parse({
    model: MODELO,
    max_tokens: 4096,
    system: instrucciones(semanaInicioISO, nombrePersona),
    messages: [
      {
        role: "user",
        content: `Semana de referencia (lunes): ${semanaInicioISO}\n\nHorario en texto:\n${texto}`,
      },
    ],
    output_config: { format: zodOutputFormat(horarioExtraidoSchema) },
  });

  if (!response.parsed_output) {
    throw new Error("La IA no devolvió un resultado válido.");
  }
  return response.parsed_output.turnos;
}

export async function interpretarHorarioFoto(
  imagenBase64: string,
  mediaType: "image/jpeg" | "image/png" | "image/webp",
  semanaInicioISO: string,
  nombrePersona?: string,
): Promise<TurnoPropuesto[]> {
  const response = await client.messages.parse({
    model: MODELO,
    max_tokens: 4096,
    system: instrucciones(semanaInicioISO, nombrePersona),
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: imagenBase64 } },
          {
            type: "text",
            text: `Semana de referencia (lunes): ${semanaInicioISO}\n\nLee el horario de la foto y conviértelo a turnos.`,
          },
        ],
      },
    ],
    output_config: { format: zodOutputFormat(horarioExtraidoSchema) },
  });

  if (!response.parsed_output) {
    throw new Error("La IA no devolvió un resultado válido.");
  }
  return response.parsed_output.turnos;
}
