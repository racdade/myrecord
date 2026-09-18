import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { EMAIL_ADMIN } from "@/lib/admin";
import { Reveal } from "@/components/marketing/reveal";
import { MobileMenu } from "@/components/marketing/mobile-menu";

export const metadata: Metadata = {
  title: "Llankia — Tus horas, claras.",
  description:
    "Registra tus horas de trabajo y tus horas extra en segundos. Sube la foto de tu horario, la IA la lee, tú confirmas y Llankia calcula todo por ti.",
  openGraph: {
    title: "Llankia — Tus horas, claras.",
    description:
      "Registra tus horas de trabajo y tus horas extra en segundos. Sube la foto de tu horario, la IA la lee, tú confirmas y Llankia calcula todo por ti.",
    url: "/",
    siteName: "Llankia",
    locale: "es_PE",
    type: "website",
    images: [{ url: "/icons/icon-512.png", width: 512, height: 512, alt: "Llankia" }],
  },
  twitter: {
    card: "summary",
    title: "Llankia — Tus horas, claras.",
    description: "Registra tus horas de trabajo y tus horas extra en segundos.",
    images: ["/icons/icon-512.png"],
  },
};

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

function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#E8E8E8] bg-white/92 backdrop-blur-xl">
      <div className="relative mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="" width={24} height={24} aria-hidden="true" />
          <span className="text-[17px] font-medium tracking-tight">Llankia</span>
        </Link>
        <nav className="hidden items-center gap-8 text-[15px] font-medium md:flex" aria-label="Principal">
          <a href="#como-funciona" className="transition-opacity hover:opacity-60">
            Cómo funciona
          </a>
          <a href="#precios" className="transition-opacity hover:opacity-60">
            Precios
          </a>
          <a href="#nosotros" className="transition-opacity hover:opacity-60">
            Nosotros
          </a>
        </nav>
        <Link
          href="/login"
          className="hidden rounded-full bg-[#0A0A0A] px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-70 md:block"
        >
          Empezar gratis
        </Link>
        <MobileMenu />
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="mx-auto max-w-[1080px] px-6 pb-20 pt-16 text-center md:pb-32 md:pt-24">
      <Reveal className="flex justify-center">
        <Image src="/logo.svg" alt="Llankia" width={56} height={56} className="md:h-[84px] md:w-[84px]" />
      </Reveal>
      <Reveal delay={80}>
        <h1 className="mt-8 text-[46px] font-medium leading-[1.02] tracking-[-0.03em] md:text-[92px]">
          Tus horas, claras.
        </h1>
      </Reveal>
      <Reveal delay={140}>
        <p className="mx-auto mt-6 max-w-lg text-[17px] text-[#6B6B6B] md:max-w-none md:text-[22px]">
          Registra tus horas y tus extras en segundos.
        </p>
      </Reveal>
      <Reveal delay={200}>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/login"
            className="rounded-full bg-[#0A0A0A] px-7 py-3.5 text-[15px] font-medium text-white transition-opacity hover:opacity-70"
          >
            Empezar gratis
          </Link>
          <a href="#como-funciona" className="text-[15px] font-medium underline underline-offset-4 transition-opacity hover:opacity-60">
            Ver cómo funciona
          </a>
        </div>
      </Reveal>
      <Reveal delay={360} className="mt-16 flex justify-center md:mt-20">
        <PhoneFrame>
          <PhoneStatusBar />
          <p className="mt-5 text-[11px] font-medium tracking-[0.1em] text-[#6B6B6B]">ESTA SEMANA</p>
          <p className="mt-1.5 text-[20px] font-medium tracking-tight">38 h + 4 h 30 extra</p>
          <WeekChart className="mt-5" />
          <div className="mt-5 flex flex-col gap-2.5 border-t border-[#E8E8E8] pt-4">
            <StatRow label="Horas normales" value="152 h" />
            <StatRow label="Horas extra" value="12 h 30" />
            <StatRow label="Pago estimado" value="S/ 1,840" />
          </div>
        </PhoneFrame>
      </Reveal>
    </section>
  );
}

function Problema() {
  return (
    <section className="mx-auto max-w-[920px] px-6 py-20 text-center md:py-28">
      <Reveal>
        <p className="text-[28px] font-medium leading-[1.2] tracking-[-0.02em] md:text-[44px]">
          Tu horario cambia cada semana.{" "}
          <span className="text-[#6B6B6B]">Tus horas extra terminan en una libreta.</span>
        </p>
      </Reveal>
    </section>
  );
}

function ComoFunciona() {
  return (
    <section id="como-funciona" className="mx-auto max-w-[1080px] px-6">
      <Paso
        numero={1}
        titulo="Sube la foto de tu horario."
        bodyDesktop="La foto del papel pegado en la pared, la captura del grupo o tu propio texto. La IA lo lee y lo convierte en turnos."
        bodyMobile="La IA lo lee y lo convierte en turnos."
        invertido={false}
      >
        <PhoneFrame>
          <div className="rounded-2xl border border-dashed border-[#E8E8E8] p-4">
            <p className="text-[13px] font-medium">Horario_semana.jpg</p>
            <div className="mt-3 flex flex-col gap-1.5">
              <div className="h-2 w-full rounded-full bg-[#E8E8E8]" />
              <div className="h-2 w-4/5 rounded-full bg-[#E8E8E8]" />
              <div className="h-2 w-3/5 rounded-full bg-[#E8E8E8]" />
            </div>
          </div>
          <p className="mt-4 text-center text-[12px] text-[#6B6B6B]">o escribe tu horario</p>
          <div className="mt-3 rounded-xl border border-[#E8E8E8] px-3.5 py-3 text-[13px] text-[#0A0A0A]">
            Lun a vie 14:00–22:00, sáb 8:00–14:00
          </div>
          <button
            type="button"
            tabIndex={-1}
            className="mt-4 w-full rounded-full bg-[#0A0A0A] py-2.5 text-[14px] font-medium text-white"
          >
            Analizar
          </button>
        </PhoneFrame>
      </Paso>

      <Paso
        numero={2}
        titulo="Confirma tus turnos."
        bodyDesktop="Revisas, corriges lo que haga falta y listo. Tú siempre tienes la última palabra."
        bodyMobile="Revisas, corriges y listo. Tú tienes la última palabra."
        invertido
      >
        <PhoneFrame>
          <p className="text-[13px] font-medium">6 turnos detectados</p>
          <div className="mt-3 flex flex-col overflow-hidden rounded-2xl border border-[#E8E8E8]">
            <TurnoRow fecha="Lun 14" rango="14:00–22:00" horas="8 h" confirmado />
            <TurnoRow fecha="Mar 15" rango="14:00–23:30" horas="8 h + 1 h 30 extra" confirmado />
            <TurnoRow fecha="Mié 16" rango="10:00–16:00" horas="6 h" />
            <TurnoRow fecha="Jue 17" rango="14:00–22:00" horas="8 h" className="hidden md:flex" />
            <TurnoRow fecha="Vie 18" rango="14:00–22:00" horas="8 h" className="hidden md:flex" />
          </div>
          <button
            type="button"
            tabIndex={-1}
            className="mt-4 w-full rounded-full bg-[#0A0A0A] py-2.5 text-[14px] font-medium text-white"
          >
            Confirmar semana
          </button>
          <p className="mt-3 hidden text-center text-[13px] font-medium underline underline-offset-4 md:block">
            Editar un turno
          </p>
        </PhoneFrame>
      </Paso>

      <Paso
        numero={3}
        titulo="Mira tus horas y tus extras."
        bodyDesktop="Cada día contado, cada extra separada. Sin sumas a mano al final del mes."
        bodyMobile="Cada día contado, cada extra separada."
        invertido={false}
      >
        <PhoneFrame>
          <p className="text-[11px] font-medium tracking-[0.1em] text-[#6B6B6B]">TOTAL DEL MES</p>
          <p className="mt-1.5 text-[24px] font-medium tracking-tight">164 h 30</p>
          <div className="mt-5 flex flex-col gap-3">
            <ProgressRow label="Horas normales" value="152 h" porcentaje={92} />
            <ProgressRow label="Horas extra" value="12 h 30" porcentaje={22} />
          </div>
          <div className="mt-5 flex flex-col gap-2 border-t border-[#E8E8E8] pt-4">
            <SemanaRow semana="Sem 1" horas="38 h" extra="2 h" />
            <SemanaRow semana="Sem 2" horas="40 h" extra="3 h" />
            <SemanaRow semana="Sem 3" horas="39 h" extra="3 h 30" />
            <SemanaRow semana="Sem 4" horas="35 h" extra="4 h" className="hidden md:flex" />
          </div>
        </PhoneFrame>
      </Paso>
    </section>
  );
}

function Paso({
  numero,
  titulo,
  bodyDesktop,
  bodyMobile,
  invertido,
  children,
}: {
  numero: number;
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
          <p className="text-[13px] font-medium tracking-[0.1em] text-[#6B6B6B]">PASO {numero}</p>
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

function DashboardShowcase() {
  return (
    <section className="mx-auto max-w-[1080px] px-6 py-20 text-center md:py-32">
      <Reveal>
        <h2 className="text-[32px] font-medium tracking-[-0.025em] md:text-[64px]">Todo tu mes, de un vistazo.</h2>
      </Reveal>
      <Reveal delay={80}>
        <p className="mx-auto mt-4 max-w-md text-[17px] text-[#6B6B6B] md:text-[19px]">
          El dashboard de Llankia en el navegador o en el celular.
        </p>
      </Reveal>
      <Reveal delay={160} className="mt-12">
        <div className="mx-auto max-w-[720px] rounded-[24px] border border-[#E8E8E8] p-6 text-left md:p-10">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-[17px] font-medium">Septiembre 2026</p>
            <p className="hidden text-[13px] text-[#6B6B6B] md:block">Semana 16 – 22</p>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-4">
            <StatBlock label="Horas normales" value="152 h" />
            <StatBlock label="Horas extra" value="12 h 30" />
            <StatBlock label="Pago estimado" value="S/ 1,840" />
          </div>
          <WeekChart className="mt-8" alto />
        </div>
      </Reveal>
    </section>
  );
}

function CalendarSync() {
  return (
    <section className="mx-auto max-w-[920px] px-6 py-20 text-center md:py-28">
      <Reveal>
        <h2 className="text-[28px] font-medium tracking-[-0.025em] md:text-[48px]">Tus turnos, en tu calendario.</h2>
      </Reveal>
      <Reveal delay={80}>
        <p className="mx-auto mt-4 max-w-md text-[17px] text-[#6B6B6B]">
          <span className="hidden md:inline">Confirmas una vez y tus turnos aparecen en Google Calendar.</span>
          <span className="md:hidden">Confirmas una vez y aparecen en Google Calendar.</span>
        </p>
      </Reveal>
      <Reveal delay={160} className="mt-12">
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-center md:gap-6">
          <div className="w-full max-w-[280px] rounded-2xl border border-[#E8E8E8] p-5 text-left">
            <p className="text-[11px] font-medium tracking-[0.1em] text-[#6B6B6B]">LLANKIA</p>
            <div className="mt-3 flex flex-col gap-2">
              <TurnoMini fecha="Lun 16" rango="14:00–22:00" />
              <TurnoMini fecha="Mar 17" rango="14:00–23:30" />
              <TurnoMini fecha="Mié 18" rango="10:00–16:00" />
            </div>
          </div>
          <span aria-hidden="true" className="text-2xl text-[#6B6B6B]">
            →
          </span>
          <div className="w-full max-w-[280px] rounded-2xl border border-[#E8E8E8] p-5 text-left">
            <p className="text-[11px] font-medium tracking-[0.1em] text-[#6B6B6B]">GOOGLE CALENDAR</p>
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

function Equipos() {
  const filas = [
    { persona: "Rosa Quispe", horas: "168 h", extras: "9 h 00" },
    { persona: "Luis Paredes", horas: "152 h", extras: "12 h 30" },
    { persona: "Ana Ccahuana", horas: "144 h", extras: "0 h 00" },
    { persona: "Jorge Mamani", horas: "176 h", extras: "18 h 15" },
  ];

  return (
    <section className="mx-auto max-w-[860px] px-6 py-20 text-center md:py-28">
      <Reveal>
        <h2 className="text-[28px] font-medium leading-[1.15] tracking-[-0.025em] md:text-[48px]">
          ¿Administras un equipo? Ve las horas de todos en un solo lugar.
        </h2>
      </Reveal>
      <Reveal delay={140} className="mt-12">
        <div className="overflow-hidden rounded-2xl border border-[#E8E8E8] text-left">
          <div className="grid grid-cols-3 gap-2 border-b border-[#E8E8E8] bg-[#FAFAFA] px-5 py-3 text-[12px] font-medium tracking-[0.06em] text-[#6B6B6B]">
            <span>PERSONA</span>
            <span className="text-right">HORAS</span>
            <span className="text-right">EXTRAS</span>
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

function Precios() {
  return (
    <section id="precios" className="mx-auto max-w-[920px] px-6 py-20 text-center md:py-28">
      <Reveal>
        <h2 className="text-[32px] font-medium tracking-[-0.025em] md:text-[56px]">Precios.</h2>
      </Reveal>
      <Reveal delay={80}>
        <p className="mx-auto mt-4 max-w-md text-[17px] text-[#6B6B6B]">
          Empieza gratis. Paga solo si administras un equipo.
        </p>
      </Reveal>
      <Reveal delay={160} className="mt-12">
        <div className="grid gap-5 md:grid-cols-2">
          <PlanCard
            nombre="Personal"
            precio="Gratis"
            features={["Turnos ilimitados", "Lectura de horarios con IA", "Horas extra separadas", "Google Calendar"]}
            cta={{ label: "Empezar gratis", href: "/login", variante: "solido" }}
          />
          <PlanCard
            nombre="Administración"
            precio="Para equipos"
            features={["Todo lo del plan personal", "Horas de todo el equipo", "Reportes por mes", "Exportar a Excel"]}
            cta={{ label: "Hablar con nosotros", href: `mailto:${EMAIL_ADMIN}`, variante: "borde" }}
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

function ElNombre() {
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
          Llankia nace de <em className="not-italic italic">llank&apos;ay</em>: trabajar.
        </p>
      </Reveal>
      <Reveal delay={180}>
        <p className="mx-auto mt-5 max-w-md text-[15px] text-[#A8A8A8] md:text-[17px]">
          Un reloj que se cierra con un check: tiempo registrado, semana resuelta.
        </p>
      </Reveal>
    </section>
  );
}

function Cierre() {
  return (
    <section className="mx-auto max-w-[920px] px-6 py-24 text-center md:py-36">
      <Reveal>
        <h2 className="text-[36px] font-medium tracking-[-0.03em] md:text-[72px]">Empieza hoy. Es gratis.</h2>
      </Reveal>
      <Reveal delay={120} className="mt-8">
        <Link
          href="/login"
          className="inline-block rounded-full bg-[#0A0A0A] px-7 py-3.5 text-[15px] font-medium text-white transition-opacity hover:opacity-70"
        >
          Empezar gratis
        </Link>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[#E8E8E8] px-6 py-12">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col items-center gap-4 text-center md:items-start md:text-left">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Llankia" width={18} height={18} />
            <span className="text-[15px] font-medium">Llankia</span>
          </Link>
          <nav
            className="grid grid-cols-2 gap-x-6 gap-y-3 text-[14px] text-[#6B6B6B] sm:flex sm:flex-wrap sm:justify-center md:justify-start"
            aria-label="Legal"
          >
            <Link href="/sobre-nosotros" className="transition-opacity hover:opacity-60">
              Sobre nosotros
            </Link>
            <a href={`mailto:${EMAIL_ADMIN}`} className="transition-opacity hover:opacity-60">
              Contacto
            </a>
          </nav>
        </div>
        <div className="flex flex-col items-center gap-2 text-center md:items-end md:text-right">
          <p className="text-[13px] text-[#6B6B6B]">Hecho en Lima 🇵🇪</p>
          <p className="max-w-xs text-[12px] text-[#6B6B6B]">
            Llankia es una herramienta de registro personal de horas. Los cálculos de horas extra son referenciales.
          </p>
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

const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const ALTURAS_SEMANA = [70, 85, 60, 90, 75, 30, 15];

function WeekChart({ className, alto = false }: { className?: string; alto?: boolean }) {
  return (
    <div className={`flex items-end gap-2 ${alto ? "h-32" : "h-20"} ${className ?? ""}`}>
      {DIAS_SEMANA.map((dia, i) => (
        <div key={dia} className="flex flex-1 flex-col items-center gap-1.5">
          <div
            className={`w-full rounded-[3px] ${i >= 5 ? "bg-[#E8E8E8]" : "bg-[#0A0A0A]"}`}
            style={{ height: `${(ALTURAS_SEMANA[i] / 100) * (alto ? 128 : 80)}px` }}
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
        {horas} <span className="text-[#6B6B6B]">+ {extra} extra</span>
      </span>
    </div>
  );
}
