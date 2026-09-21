import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { EMAIL_ADMIN } from "@/lib/admin";
import { Reveal } from "@/components/marketing/reveal";
import { MobileMenu } from "@/components/marketing/mobile-menu";
import { LanguageSwitcher } from "@/components/marketing/language-switcher";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("marketing.meta");
  return {
    title: t("titulo"),
    description: t("descripcion"),
    openGraph: {
      title: t("titulo"),
      description: t("descripcion"),
      url: "/",
      siteName: "Llankia",
      type: "website",
      images: [{ url: "/icons/icon-512.png", width: 512, height: 512, alt: "Llankia" }],
    },
    twitter: {
      card: "summary",
      title: t("titulo"),
      description: t("descripcionCorta"),
      images: ["/icons/icon-512.png"],
    },
  };
}

export default function LandingPage() {
  return (
    <div className="bg-white text-[#0A0A0A]">
      <Nav />
      <Hero />
      <Problema />
      <ComoFunciona />
      <DashboardShowcase />
      <CalendarSync />
      <Equipos />
      <Precios />
      <ElNombre />
      <Cierre />
      <Footer />
    </div>
  );
}

async function Nav() {
  const t = await getTranslations("marketing.nav");

  return (
    <header className="sticky top-0 z-50 border-b border-[#E8E8E8] bg-white/92 backdrop-blur-xl">
      <div className="relative mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="" width={24} height={24} aria-hidden="true" />
          <span className="text-[17px] font-medium tracking-tight">Llankia</span>
        </Link>
        <nav className="hidden items-center gap-8 text-[15px] font-medium md:flex" aria-label="Principal">
          <a href="#como-funciona" className="transition-opacity hover:opacity-60">
            {t("comoFunciona")}
          </a>
          <a href="#precios" className="transition-opacity hover:opacity-60">
            {t("precios")}
          </a>
          <a href="#nosotros" className="transition-opacity hover:opacity-60">
            {t("nosotros")}
          </a>
        </nav>
        <div className="hidden items-center gap-6 md:flex">
          <LanguageSwitcher />
          <Link
            href="/login"
            className="rounded-full bg-[#0A0A0A] px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-70"
          >
            {t("empezarGratis")}
          </Link>
        </div>
        <MobileMenu />
      </div>
    </header>
  );
}

async function Hero() {
  const t = await getTranslations("marketing.hero");
  const tRoot = await getTranslations("marketing");
  const dias = tRoot.raw("diasSemana") as string[];

  return (
    <section className="mx-auto max-w-[1080px] px-6 pb-20 pt-16 text-center md:pb-32 md:pt-24">
      <Reveal className="flex justify-center">
        <Image src="/logo.svg" alt="Llankia" width={56} height={56} className="md:h-[84px] md:w-[84px]" />
      </Reveal>
      <Reveal delay={80}>
        <h1 className="mt-8 text-[46px] font-medium leading-[1.02] tracking-[-0.03em] md:text-[92px]">
          {t("titulo")}
        </h1>
      </Reveal>
      <Reveal delay={140}>
        <p className="mx-auto mt-6 max-w-lg text-[17px] text-[#6B6B6B] md:max-w-none md:text-[22px]">
          {t("subtitulo")}
        </p>
      </Reveal>
      <Reveal delay={200}>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/login"
            className="rounded-full bg-[#0A0A0A] px-7 py-3.5 text-[15px] font-medium text-white transition-opacity hover:opacity-70"
          >
            {t("ctaPrincipal")}
          </Link>
          <a href="#como-funciona" className="text-[15px] font-medium underline underline-offset-4 transition-opacity hover:opacity-60">
            {t("ctaSecundario")}
          </a>
        </div>
      </Reveal>
      <Reveal delay={360} className="mt-16 flex justify-center md:mt-20">
        <PhoneFrame>
          <PhoneStatusBar />
          <p className="mt-5 text-[11px] font-medium tracking-[0.1em] text-[#6B6B6B]">{t("estaSemana")}</p>
          <p className="mt-1.5 text-[20px] font-medium tracking-tight">{t("resumenHoras")}</p>
          <WeekChart dias={dias} className="mt-5" />
          <div className="mt-5 flex flex-col gap-2.5 border-t border-[#E8E8E8] pt-4">
            <StatRow label={t("horasNormales")} value="152 h" />
            <StatRow label={t("horasExtra")} value="12 h 30" />
            <StatRow label={t("pagoEstimado")} value="S/ 1,840" />
          </div>
        </PhoneFrame>
      </Reveal>
    </section>
  );
}

async function Problema() {
  const t = await getTranslations("marketing.problema");

  return (
    <section className="mx-auto max-w-[920px] px-6 py-20 text-center md:py-28">
      <Reveal>
        <p className="text-[28px] font-medium leading-[1.2] tracking-[-0.02em] md:text-[44px]">
          {t("parte1")} <span className="text-[#6B6B6B]">{t("parte2")}</span>
        </p>
      </Reveal>
    </section>
  );
}

async function ComoFunciona() {
  const t = await getTranslations("marketing.comoFunciona");
  const filas = t.raw("paso2.filas") as { fecha: string; rango: string; horas: string; confirmado: boolean }[];
  const semanas = t.raw("paso3.semanas") as { semana: string; horas: string; extra: string }[];

  return (
    <section id="como-funciona" className="mx-auto max-w-[1080px] px-6">
      <Paso
        numero={1}
        pasoLabel={t("pasoLabel")}
        titulo={t("paso1.titulo")}
        bodyDesktop={t("paso1.bodyDesktop")}
        bodyMobile={t("paso1.bodyMobile")}
        invertido={false}
      >
        <PhoneFrame>
          <div className="rounded-2xl border border-dashed border-[#E8E8E8] p-4">
            <p className="text-[13px] font-medium">{t("paso1.archivo")}</p>
            <div className="mt-3 flex flex-col gap-1.5">
              <div className="h-2 w-full rounded-full bg-[#E8E8E8]" />
              <div className="h-2 w-4/5 rounded-full bg-[#E8E8E8]" />
              <div className="h-2 w-3/5 rounded-full bg-[#E8E8E8]" />
            </div>
          </div>
          <p className="mt-4 text-center text-[12px] text-[#6B6B6B]">{t("paso1.oEscribe")}</p>
          <div className="mt-3 rounded-xl border border-[#E8E8E8] px-3.5 py-3 text-[13px] text-[#0A0A0A]">
            {t("paso1.horarioEjemplo")}
          </div>
          <button
            type="button"
            tabIndex={-1}
            className="mt-4 w-full rounded-full bg-[#0A0A0A] py-2.5 text-[14px] font-medium text-white"
          >
            {t("paso1.botonAnalizar")}
          </button>
        </PhoneFrame>
      </Paso>

      <Paso
        numero={2}
        pasoLabel={t("pasoLabel")}
        titulo={t("paso2.titulo")}
        bodyDesktop={t("paso2.bodyDesktop")}
        bodyMobile={t("paso2.bodyMobile")}
        invertido
      >
        <PhoneFrame>
          <p className="text-[13px] font-medium">{t("paso2.turnosDetectados")}</p>
          <div className="mt-3 flex flex-col overflow-hidden rounded-2xl border border-[#E8E8E8]">
            {filas.map((fila, i) => (
              <TurnoRow
                key={fila.fecha}
                fecha={fila.fecha}
                rango={fila.rango}
                horas={fila.horas}
                confirmado={fila.confirmado}
                className={i >= 3 ? "hidden md:flex" : undefined}
              />
            ))}
          </div>
          <button
            type="button"
            tabIndex={-1}
            className="mt-4 w-full rounded-full bg-[#0A0A0A] py-2.5 text-[14px] font-medium text-white"
          >
            {t("paso2.botonConfirmar")}
          </button>
          <p className="mt-3 hidden text-center text-[13px] font-medium underline underline-offset-4 md:block">
            {t("paso2.editarTurno")}
          </p>
        </PhoneFrame>
      </Paso>

      <Paso
        numero={3}
        pasoLabel={t("pasoLabel")}
        titulo={t("paso3.titulo")}
        bodyDesktop={t("paso3.bodyDesktop")}
        bodyMobile={t("paso3.bodyMobile")}
        invertido={false}
      >
        <PhoneFrame>
          <p className="text-[11px] font-medium tracking-[0.1em] text-[#6B6B6B]">{t("paso3.totalDelMes")}</p>
          <p className="mt-1.5 text-[24px] font-medium tracking-tight">{t("paso3.totalHoras")}</p>
          <div className="mt-5 flex flex-col gap-3">
            <ProgressRow label={t("paso3.horasNormales")} value="152 h" porcentaje={92} />
            <ProgressRow label={t("paso3.horasExtra")} value="12 h 30" porcentaje={22} />
          </div>
          <div className="mt-5 flex flex-col gap-2 border-t border-[#E8E8E8] pt-4">
            {semanas.map((s, i) => (
              <SemanaRow
                key={s.semana}
                semana={s.semana}
                horas={s.horas}
                extra={s.extra}
                className={i >= 3 ? "hidden md:flex" : undefined}
              />
            ))}
          </div>
        </PhoneFrame>
      </Paso>
    </section>
  );
}

function Paso({
  numero,
  pasoLabel,
  titulo,
  bodyDesktop,
  bodyMobile,
  invertido,
  children,
}: {
  numero: number;
  pasoLabel: string;
  titulo: string;
  bodyDesktop: string;
  bodyMobile: string;
  invertido: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="grid items-center gap-10 border-t border-[#E8E8E8] py-16 md:min-h-[820px] md:grid-cols-2 md:gap-16 md:py-0">
      <Reveal className={invertido ? "md:order-2" : undefined}>
        <div className="text-center md:text-left">
          <p className="text-[13px] font-medium tracking-[0.1em] text-[#6B6B6B]">
            {pasoLabel} {numero}
          </p>
          <h2 className="mt-3 text-[32px] font-medium leading-[1.1] tracking-[-0.025em] md:text-[56px]">{titulo}</h2>
          <p className="mx-auto mt-4 max-w-sm text-[17px] text-[#6B6B6B] md:mx-0 md:hidden">{bodyMobile}</p>
          <p className="mx-auto mt-4 hidden max-w-sm text-[19px] text-[#6B6B6B] md:mx-0 md:block">{bodyDesktop}</p>
        </div>
      </Reveal>
      <Reveal delay={140} className={`flex justify-center ${invertido ? "md:order-1" : ""}`}>
        {children}
      </Reveal>
    </div>
  );
}

async function DashboardShowcase() {
  const t = await getTranslations("marketing.dashboardShowcase");
  const tRoot = await getTranslations("marketing");
  const dias = tRoot.raw("diasSemana") as string[];

  return (
    <section className="mx-auto max-w-[1080px] px-6 py-20 text-center md:py-32">
      <Reveal>
        <h2 className="text-[32px] font-medium tracking-[-0.025em] md:text-[64px]">{t("titulo")}</h2>
      </Reveal>
      <Reveal delay={80}>
        <p className="mx-auto mt-4 max-w-md text-[17px] text-[#6B6B6B] md:text-[19px]">{t("subtitulo")}</p>
      </Reveal>
      <Reveal delay={160} className="mt-12">
        <div className="mx-auto max-w-[720px] rounded-[24px] border border-[#E8E8E8] p-6 text-left md:p-10">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-[17px] font-medium">{t("mes")}</p>
            <p className="hidden text-[13px] text-[#6B6B6B] md:block">{t("semana")}</p>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-4">
            <StatBlock label={t("horasNormales")} value="152 h" />
            <StatBlock label={t("horasExtra")} value="12 h 30" />
            <StatBlock label={t("pagoEstimado")} value="S/ 1,840" />
          </div>
          <WeekChart dias={dias} className="mt-8" alto />
        </div>
      </Reveal>
    </section>
  );
}

async function CalendarSync() {
  const t = await getTranslations("marketing.calendarSync");
  const turnos = t.raw("turnos") as { fecha: string; rango: string }[];

  return (
    <section className="mx-auto max-w-[920px] px-6 py-20 text-center md:py-28">
      <Reveal>
        <h2 className="text-[28px] font-medium tracking-[-0.025em] md:text-[48px]">{t("titulo")}</h2>
      </Reveal>
      <Reveal delay={80}>
        <p className="mx-auto mt-4 max-w-md text-[17px] text-[#6B6B6B]">
          <span className="hidden md:inline">{t("subtituloDesktop")}</span>
          <span className="md:hidden">{t("subtituloMobile")}</span>
        </p>
      </Reveal>
      <Reveal delay={160} className="mt-12">
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-center md:gap-6">
          <div className="w-full max-w-[280px] rounded-2xl border border-[#E8E8E8] p-5 text-left">
            <p className="text-[11px] font-medium tracking-[0.1em] text-[#6B6B6B]">{t("llankiaLabel")}</p>
            <div className="mt-3 flex flex-col gap-2">
              {turnos.map((turno) => (
                <TurnoMini key={turno.fecha} fecha={turno.fecha} rango={turno.rango} />
              ))}
            </div>
          </div>
          <span aria-hidden="true" className="text-2xl text-[#6B6B6B]">
            →
          </span>
          <div className="w-full max-w-[280px] rounded-2xl border border-[#E8E8E8] p-5 text-left">
            <p className="text-[11px] font-medium tracking-[0.1em] text-[#6B6B6B]">{t("googleLabel")}</p>
            <div className="mt-3 grid grid-cols-7 gap-1.5">
              {Array.from({ length: 14 }, (_, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-[4px] ${
                    [1, 2, 4, 8, 9, 11].includes(i) ? "bg-[#0A0A0A]" : "border border-[#E8E8E8]"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

async function Equipos() {
  const t = await getTranslations("marketing.equipos");
  const filas = [
    { persona: "Rosa Quispe", horas: "168 h", extras: "9 h 00" },
    { persona: "Luis Paredes", horas: "152 h", extras: "12 h 30" },
    { persona: "Ana Ccahuana", horas: "144 h", extras: "0 h 00" },
    { persona: "Jorge Mamani", horas: "176 h", extras: "18 h 15" },
  ];

  return (
    <section className="mx-auto max-w-[860px] px-6 py-20 text-center md:py-28">
      <Reveal>
        <h2 className="text-[28px] font-medium leading-[1.15] tracking-[-0.025em] md:text-[48px]">{t("titulo")}</h2>
      </Reveal>
      <Reveal delay={140} className="mt-12">
        <div className="overflow-hidden rounded-2xl border border-[#E8E8E8] text-left">
          <div className="grid grid-cols-3 gap-2 border-b border-[#E8E8E8] bg-[#FAFAFA] px-5 py-3 text-[12px] font-medium tracking-[0.06em] text-[#6B6B6B]">
            <span>{t("persona")}</span>
            <span className="text-right">{t("horas")}</span>
            <span className="text-right">{t("extras")}</span>
          </div>
          {filas.map((fila) => (
            <div
              key={fila.persona}
              className="grid grid-cols-3 gap-2 border-b border-[#E8E8E8] px-5 py-3.5 text-[14px] last:border-b-0"
            >
              <span className="font-medium">{fila.persona}</span>
              <span className="text-right text-[#6B6B6B]">{fila.horas}</span>
              <span className="text-right text-[#6B6B6B]">{fila.extras}</span>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

async function Precios() {
  const t = await getTranslations("marketing.precios");
  const personalFeatures = t.raw("personal.features") as string[];
  const administracionFeatures = t.raw("administracion.features") as string[];

  return (
    <section id="precios" className="mx-auto max-w-[920px] px-6 py-20 text-center md:py-28">
      <Reveal>
        <h2 className="text-[32px] font-medium tracking-[-0.025em] md:text-[56px]">{t("titulo")}</h2>
      </Reveal>
      <Reveal delay={80}>
        <p className="mx-auto mt-4 max-w-md text-[17px] text-[#6B6B6B]">{t("subtitulo")}</p>
      </Reveal>
      <Reveal delay={160} className="mt-12">
        <div className="grid gap-5 md:grid-cols-2">
          <PlanCard
            nombre={t("personal.nombre")}
            precio={t("personal.precio")}
            features={personalFeatures}
            cta={{ label: t("personal.cta"), href: "/login", variante: "solido" }}
          />
          <PlanCard
            nombre={t("administracion.nombre")}
            precio={t("administracion.precio")}
            features={administracionFeatures}
            cta={{ label: t("administracion.cta"), href: `mailto:${EMAIL_ADMIN}`, variante: "borde" }}
          />
        </div>
      </Reveal>
    </section>
  );
}

function PlanCard({
  nombre,
  precio,
  features,
  cta,
}: {
  nombre: string;
  precio: string;
  features: string[];
  cta: { label: string; href: string; variante: "solido" | "borde" };
}) {
  return (
    <div className="flex flex-col rounded-[24px] border border-[#E8E8E8] p-8 text-left">
      <p className="text-[15px] font-medium text-[#6B6B6B]">{nombre}</p>
      <p className="mt-2 text-[28px] font-medium tracking-tight">{precio}</p>
      <ul className="mt-6 flex flex-col gap-3 text-[15px]">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2.5">
            <span aria-hidden="true">✓</span>
            {f}
          </li>
        ))}
      </ul>
      <Link
        href={cta.href}
        className={`mt-8 rounded-full px-6 py-3 text-center text-[15px] font-medium transition-opacity hover:opacity-70 ${
          cta.variante === "solido" ? "bg-[#0A0A0A] text-white" : "border border-[#0A0A0A] text-[#0A0A0A]"
        }`}
      >
        {cta.label}
      </Link>
    </div>
  );
}

async function ElNombre() {
  const t = await getTranslations("marketing.elNombre");

  return (
    <section id="nosotros" className="bg-[#0A0A0A] px-6 py-20 text-center text-white md:py-32">
      <Reveal className="flex justify-center">
        <Image
          src="/logo.svg"
          alt=""
          width={56}
          height={56}
          aria-hidden="true"
          className="brightness-0 invert md:h-[72px] md:w-[72px]"
        />
      </Reveal>
      <Reveal delay={100}>
        <p className="mx-auto mt-8 max-w-2xl text-[26px] font-medium leading-[1.25] tracking-[-0.02em] md:text-[40px]">
          {t.rich("frase1", { em: (chunks) => <em className="not-italic italic">{chunks}</em> })}
        </p>
      </Reveal>
      <Reveal delay={180}>
        <p className="mx-auto mt-5 max-w-md text-[15px] text-[#A8A8A8] md:text-[17px]">{t("frase2")}</p>
      </Reveal>
    </section>
  );
}

async function Cierre() {
  const t = await getTranslations("marketing.cierre");

  return (
    <section className="mx-auto max-w-[920px] px-6 py-24 text-center md:py-36">
      <Reveal>
        <h2 className="text-[36px] font-medium tracking-[-0.03em] md:text-[72px]">{t("titulo")}</h2>
      </Reveal>
      <Reveal delay={120} className="mt-8">
        <Link
          href="/login"
          className="inline-block rounded-full bg-[#0A0A0A] px-7 py-3.5 text-[15px] font-medium text-white transition-opacity hover:opacity-70"
        >
          {t("cta")}
        </Link>
      </Reveal>
    </section>
  );
}

async function Footer() {
  const t = await getTranslations("marketing.footer");
  const anio = new Date().getFullYear();

  return (
    <footer className="border-t border-[#E8E8E8] px-6 py-10">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Llankia" width={20} height={20} />
            <span className="text-[15px] font-medium">Llankia</span>
          </Link>
          <LanguageSwitcher />
        </div>

        <div className="flex flex-col gap-1.5 text-[13px] leading-relaxed text-[#6B6B6B]">
          <p>{t("copyright", { anio })}</p>
          <p className="max-w-2xl">
            {t("disclaimer")}{" "}
            <Link href="/terminos" className="underline underline-offset-4 transition-opacity hover:opacity-60">
              {t("masInfo")}
            </Link>
            .
          </p>
        </div>

        <div className="h-px bg-[#E8E8E8]" />

        <div className="flex flex-col items-center gap-4 text-[13px] text-[#6B6B6B] sm:flex-row sm:justify-between">
          <p>{t("hechoEnLima")}</p>
          <nav
            className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-2"
            aria-label="Legal"
          >
            <Link href="/sobre-nosotros" className="transition-opacity hover:opacity-60">
              {t("sobreNosotros")}
            </Link>
            <span aria-hidden="true">|</span>
            <Link href="/privacidad" className="transition-opacity hover:opacity-60">
              {t("privacidad")}
            </Link>
            <span aria-hidden="true">|</span>
            <Link href="/terminos" className="transition-opacity hover:opacity-60">
              {t("terminos")}
            </Link>
            <span aria-hidden="true">|</span>
            <a href={`mailto:${EMAIL_ADMIN}`} className="transition-opacity hover:opacity-60">
              {t("contacto")}
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}

// --- Piezas de las maquetas (mockups) ---

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-[320px] rounded-[40px] border-2 border-[#0A0A0A] p-5 text-left md:rounded-[48px] md:p-6">
      {children}
    </div>
  );
}

function PhoneStatusBar() {
  return (
    <div className="flex items-center justify-between text-[12px] font-medium text-[#6B6B6B]">
      <span>9:41</span>
      <span>Llankia</span>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-[14px]">
      <span className="text-[#6B6B6B]">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[12px] text-[#6B6B6B]">{label}</p>
      <p className="mt-1 text-[18px] font-medium md:text-[22px]">{value}</p>
    </div>
  );
}

function WeekChart({ dias, className, alto = false }: { dias: string[]; className?: string; alto?: boolean }) {
  const alturas = [70, 85, 60, 90, 75, 30, 15];
  return (
    <div className={`flex items-end gap-2 ${alto ? "h-32" : "h-20"} ${className ?? ""}`}>
      {dias.map((dia, i) => (
        <div key={dia} className="flex flex-1 flex-col items-center gap-1.5">
          <div
            className={`w-full rounded-[3px] ${i >= 5 ? "bg-[#E8E8E8]" : "bg-[#0A0A0A]"}`}
            style={{ height: `${(alturas[i] / 100) * (alto ? 128 : 80)}px` }}
          />
          <span className="text-[10px] text-[#6B6B6B]">{dia}</span>
        </div>
      ))}
    </div>
  );
}

function TurnoRow({
  fecha,
  rango,
  horas,
  confirmado = false,
  className,
}: {
  fecha: string;
  rango: string;
  horas: string;
  confirmado?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-between gap-3 border-b border-[#E8E8E8] bg-white px-3.5 py-3 last:border-b-0 ${className ?? ""}`}>
      <div>
        <p className="text-[13px] font-medium">
          {fecha} · {rango}
        </p>
        <p className="text-[12px] text-[#6B6B6B]">{horas}</p>
      </div>
      <span
        aria-hidden="true"
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] ${
          confirmado ? "bg-[#0A0A0A] text-white" : "border border-[#E8E8E8] text-transparent"
        }`}
      >
        ✓
      </span>
    </div>
  );
}

function TurnoMini({ fecha, rango }: { fecha: string; rango: string }) {
  return (
    <div className="flex items-center justify-between text-[12px]">
      <span className="font-medium">{fecha}</span>
      <span className="text-[#6B6B6B]">{rango}</span>
    </div>
  );
}

function ProgressRow({ label, value, porcentaje }: { label: string; value: string; porcentaje: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[13px]">
        <span className="text-[#6B6B6B]">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#E8E8E8]">
        <div className="h-full rounded-full bg-[#0A0A0A]" style={{ width: `${porcentaje}%` }} />
      </div>
    </div>
  );
}

function SemanaRow({
  semana,
  horas,
  extra,
  className,
}: {
  semana: string;
  horas: string;
  extra: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-between text-[13px] ${className ?? ""}`}>
      <span className="text-[#6B6B6B]">{semana}</span>
      <span>
        {horas} <span className="text-[#6B6B6B]">+ {extra}</span>
      </span>
    </div>
  );
}
