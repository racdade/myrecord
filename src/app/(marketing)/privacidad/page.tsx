import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { EMAIL_ADMIN } from "@/lib/admin";
import { LanguageSwitcher } from "@/components/marketing/language-switcher";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("privacidad");
  return { title: `${t("titulo")} — Llankia` };
}

const FECHA_ACTUALIZACION = new Date("2026-09-21T00:00:00Z");

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-[22px] font-medium tracking-[-0.01em] text-[#0A0A0A]">{titulo}</h2>
      <div className="flex flex-col gap-3 text-[15px] leading-relaxed text-[#444]">{children}</div>
    </section>
  );
}

export default async function PrivacidadPage() {
  const t = await getTranslations("privacidad");
  const locale = await getLocale();
  const fecha = new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "UTC" }).format(FECHA_ACTUALIZACION);
  const tFooter = await getTranslations("marketing.footer");

  function email() {
    return (
      <a href={`mailto:${EMAIL_ADMIN}`} className="underline underline-offset-4">
        {EMAIL_ADMIN}
      </a>
    );
  }
  const enlaceGoogle = (chunks: React.ReactNode) => (
    <a
      href="https://developers.google.com/terms/api-services-user-data-policy"
      target="_blank"
      rel="noopener noreferrer"
      className="underline underline-offset-4"
    >
      {chunks}
    </a>
  );

  return (
    <div className="bg-white text-[#0A0A0A]">
      <header className="border-b border-[#E8E8E8]">
        <div className="mx-auto flex max-w-[720px] items-center justify-between px-6 py-5">
          <Link href="/" className="text-[15px] font-medium">
            Llankia
          </Link>
          <div className="flex items-center gap-5">
            <LanguageSwitcher />
            <Link href="/" className="text-[14px] text-[#6B6B6B] transition-opacity hover:opacity-60">
              {t("volverInicio")}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-[720px] flex-col gap-10 px-6 py-16">
        <div className="flex flex-col gap-2">
          <h1 className="text-[40px] font-medium tracking-[-0.02em]">{t("titulo")}</h1>
          <p className="text-[14px] text-[#6B6B6B]">{t("actualizado", { fecha })}</p>
        </div>

        <p className="text-[15px] leading-relaxed text-[#444]">{t("intro")}</p>

        <Seccion titulo={t("s1titulo")}>
          <p>{t.rich("s1cuerpo", { email })}</p>
        </Seccion>

        <Seccion titulo={t("s2titulo")}>
          <p>{t("s2p1")}</p>
          <p>{t("s2p2")}</p>
          <p>{t("s2p3")}</p>
          <p>{t("s2p4")}</p>
          <p>{t("s2p5")}</p>
        </Seccion>

        <Seccion titulo={t("s3titulo")}>
          <ul className="ml-5 flex list-disc flex-col gap-2">
            {(t.raw("s3items") as string[]).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>{t("s3final")}</p>
        </Seccion>

        <Seccion titulo={t("s4titulo")}>
          <p>{t("s4intro")}</p>
          <ul className="ml-5 flex list-disc flex-col gap-2">
            <li>{t("s4supabase")}</li>
            <li>{t("s4google")}</li>
            <li>{t("s4anthropic")}</li>
            <li>{t("s4resend")}</li>
            <li>{t("s4vercel")}</li>
          </ul>
        </Seccion>

        <Seccion titulo={t("s5titulo")}>
          <p>{t.rich("s5cuerpo", { enlace: enlaceGoogle })}</p>
        </Seccion>

        <Seccion titulo={t("s6titulo")}>
          <p>{t("s6cuerpo")}</p>
        </Seccion>

        <Seccion titulo={t("s7titulo")}>
          <p>{t.rich("s7cuerpo", { email })}</p>
        </Seccion>

        <Seccion titulo={t("s8titulo")}>
          <p>{t("s8cuerpo")}</p>
        </Seccion>

        <Seccion titulo={t("s9titulo")}>
          <p>{t.rich("s9cuerpo", { email })}</p>
        </Seccion>

        <Seccion titulo={t("s10titulo")}>
          <p>{t("s10cuerpo")}</p>
        </Seccion>

        <Seccion titulo={t("s11titulo")}>
          <p>{t("s11cuerpo")}</p>
        </Seccion>

        <Seccion titulo={t("s12titulo")}>
          <p>{t.rich("s12cuerpo", { email })}</p>
        </Seccion>
      </main>

      <footer className="border-t border-[#E8E8E8] px-6 py-8 text-center">
        <p className="text-[13px] text-[#6B6B6B]">
          {tFooter("copyright", { anio: new Date().getFullYear() })}
        </p>
      </footer>
    </div>
  );
}
