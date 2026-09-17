import Link from "next/link";
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

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Invitación a un equipo</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {!info || !info.valida ? (
            <p className="text-sm text-muted-foreground">
              Esta invitación no es válida o ya venció. Pide un enlace nuevo.
            </p>
          ) : (
            <>
              <p className="text-sm">
                Te invitaron a unirte a <strong>{info.equipo_nombre}</strong> como{" "}
                {info.rol === "admin" ? "admin" : "miembro"}.
              </p>
              {user ? (
                <form action={aceptarInvitacion.bind(null, token)}>
                  <Button type="submit">Unirme al equipo</Button>
                </form>
              ) : (
                <Link
                  href={`/login?next=${encodeURIComponent(`/invitacion/${token}`)}`}
                  className={buttonVariants({ variant: "default" })}
                >
                  Inicia sesión para unirte
                </Link>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
