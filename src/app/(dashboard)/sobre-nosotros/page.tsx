import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ValorItem {
  titulo: string;
  texto: string;
}

export default async function SobreNosotrosPage() {
  const t = await getTranslations("sobreNosotros");
  const valores = t.raw("valores.items") as ValorItem[];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <svg viewBox="0 0 48 48" width="56" height="56" aria-hidden="true" className="text-foreground">
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
        <h1 className="text-2xl font-medium tracking-wide">{t("tagline")}</h1>
        <p className="text-sm italic text-muted-foreground">{t("pronunciacion")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("nombre.titulo")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm leading-relaxed text-muted-foreground">
          <p>{t("nombre.p1")}</p>
          <p>{t("nombre.p2")}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("queEs.titulo")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm leading-relaxed text-muted-foreground">
          <p>{t("queEs.p1")}</p>
          <p>{t("queEs.p2")}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("simbolo.titulo")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground">
          <p>{t("simbolo.p1")}</p>
          <p className="border-l-2 border-foreground pl-4 italic text-foreground">{t("simbolo.frase")}</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("mision.titulo")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">{t("mision.texto")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("vision.titulo")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">{t("vision.texto")}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("valores.titulo")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {valores.map((valor) => (
            <div key={valor.titulo} className="flex flex-col gap-1">
              <p className="text-sm font-medium">{valor.titulo}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{valor.texto}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("historia.titulo")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm leading-relaxed text-muted-foreground">
          <p>{t("historia.p1")}</p>
          <p>{t("historia.p2")}</p>
        </CardContent>
      </Card>

      <p className="px-1 text-xs leading-relaxed text-muted-foreground">{t("notaLegal")}</p>
    </div>
  );
}
