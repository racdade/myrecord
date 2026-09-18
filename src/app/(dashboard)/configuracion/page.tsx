import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { esAdmin, EMAIL_ADMIN } from "@/lib/admin";
import { SelectorTema } from "./selector-tema";
import { SelectorFormatoHora } from "./selector-formato-hora";
import { SelectorIdioma } from "./selector-idioma";

export default async function ConfiguracionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("formato_hora")
    .eq("id", user.id)
    .single();

  const t = await getTranslations("configuracion");
  const tSobre = await getTranslations("sobreNosotros");
  const tNav = await getTranslations("nav");
  const tContacto = await getTranslations("contacto");

  const enlaceMailto = `mailto:${EMAIL_ADMIN}?subject=${encodeURIComponent(tContacto("asunto"))}&body=${encodeURIComponent(
    tContacto("cuerpo", { email: user.email ?? "" }),
  )}`;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("apariencia.titulo")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">{t("apariencia.descripcion")}</p>
          <SelectorTema />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("formatoHora.titulo")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">{t("formatoHora.descripcion")}</p>
          <SelectorFormatoHora valorActual={profile?.formato_hora ?? "24h"} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("idioma.titulo")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">{t("idioma.descripcion")}</p>
          <SelectorIdioma />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{tNav("sobreNosotros")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">{tSobre("configuracionDescripcion")}</p>
          <Link href="/sobre-nosotros" className={buttonVariants({ variant: "outline", size: "sm", className: "self-start" })}>
            {tSobre("verMas")}
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{tContacto("titulo")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">{tContacto("descripcion")}</p>
          <a href={enlaceMailto} className={buttonVariants({ variant: "outline", size: "sm", className: "self-start" })}>
            {tContacto("boton")}
          </a>
        </CardContent>
      </Card>

      {esAdmin(user.email) && (
        <Card>
          <CardHeader>
            <CardTitle>Panel de administrador</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">Responder mensajes de contacto.</p>
            <Link href="/admin/mensajes" className={buttonVariants({ variant: "outline", size: "sm", className: "self-start" })}>
              Ir al panel
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
