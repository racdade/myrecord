import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

export const LOCALES = ["es", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const LOCALE_POR_DEFECTO: Locale = "es";
export const COOKIE_IDIOMA = "NEXT_LOCALE";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const valorCookie = cookieStore.get(COOKIE_IDIOMA)?.value;
  const locale: Locale = valorCookie === "en" ? "en" : LOCALE_POR_DEFECTO;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
