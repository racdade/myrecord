import crypto from "node:crypto";

/**
 * Cifra/descifra el refresh token de Google antes de guardarlo en
 * `google_connections` (CLAUDE.md: "Tokens de Google se guardan cifrados").
 * AES-256-GCM con una llave de 32 bytes en `GOOGLE_TOKEN_ENCRYPTION_KEY`.
 */

const ALGORITMO = "aes-256-gcm";

function obtenerLlave(): Buffer {
  const llave = process.env.GOOGLE_TOKEN_ENCRYPTION_KEY;
  if (!llave) throw new Error("Falta GOOGLE_TOKEN_ENCRYPTION_KEY en el entorno.");
  const buffer = Buffer.from(llave, "base64");
  if (buffer.length !== 32) {
    throw new Error("GOOGLE_TOKEN_ENCRYPTION_KEY debe decodificar a 32 bytes (AES-256).");
  }
  return buffer;
}

export function cifrar(texto: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITMO, obtenerLlave(), iv);
  const cifrado = Buffer.concat([cipher.update(texto, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, cifrado]).toString("base64");
}

export function descifrar(payload: string): string {
  const datos = Buffer.from(payload, "base64");
  const iv = datos.subarray(0, 12);
  const authTag = datos.subarray(12, 28);
  const cifrado = datos.subarray(28);
  const decipher = crypto.createDecipheriv(ALGORITMO, obtenerLlave(), iv);
  decipher.setAuthTag(authTag);
  const descifrado = Buffer.concat([decipher.update(cifrado), decipher.final()]);
  return descifrado.toString("utf8");
}
