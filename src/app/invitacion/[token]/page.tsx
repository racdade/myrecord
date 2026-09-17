import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { aceptarInvitacion } from "./actions";

export default async function InvitacionPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase.rpc("obtener_invitacion", { p_token: token });
  const info = data?.[0];

  const t = await getTranslations("invitacion");
  const tc = await getTranslations("comun");

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{t("titulo")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {!info || !info.valida ? (
            <p className="text-sm text-muted-foreground">{t("noEsValida")}</p>
          ) : (
            <>
              <p className="text-sm">
                {t.rich("teInvitaronA", {
                  equipo: info.equipo_nombre ?? "",
                  rol: info.rol === "admin" ? tc("admin") : tc("miembro"),
                  strong: (chunks) => <strong>{chunks}</strong>,
                })}
              </p>
              {user ? (
                <form action={aceptarInvitacion.bind(null, token)}>
                  <Button type="submit">{t("unirme")}</Button>
                </form>
              ) : (
                <Link
                  href={`/login?next=${encodeURIComponent(`/invitacion/${token}`)}`}
                  className={buttonVariants({ variant: "default" })}
                >
                  {t("iniciaSesion")}
                </Link>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
