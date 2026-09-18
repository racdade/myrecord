import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { esAdmin } from "@/lib/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MensajeForm } from "./mensaje-form";

export default async function AdminMensajesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!esAdmin(user.email)) redirect("/dashboard");

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Responder un mensaje</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Escribe el correo con el que esa persona inició sesión y tu respuesta. Le va a
            aparecer como notificación dentro de la app.
          </p>
          <MensajeForm />
        </CardContent>
      </Card>
    </div>
  );
}
