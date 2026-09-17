import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { buttonVariants } from "@/components/ui/button";

export default async function NotFound() {
  const t = await getTranslations("errores");

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <svg viewBox="0 0 48 48" width="40" height="40" aria-hidden="true">
        <path
          d="M40.4 19.6 A17 17 0 1 1 32 9"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15 16 L24 24 L37.5 9.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-medium">{t("noEncontrada")}</h1>
        <p className="max-w-xs text-sm text-muted-foreground">{t("noEncontradaDescripcion")}</p>
      </div>
      <Link href="/" className={buttonVariants({ variant: "default" })}>
        {t("volverAlInicio")}
      </Link>
    </div>
  );
}
