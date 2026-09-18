/** Correo del único administrador de la app (dueño del proyecto). */
export const EMAIL_ADMIN = "britoadolfo9@gmail.com";

export function esAdmin(email: string | null | undefined): boolean {
  return email === EMAIL_ADMIN;
}
