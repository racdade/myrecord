import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { rangoSemanaActual } from "@/lib/semana";
import { ImportarHorarioForm } from "./importar-form";

export default async function ImportarHorarioPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { inicio } = rangoSemanaActual();

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Agregar horario con foto o texto</CardTitle>
        </CardHeader>
        <CardContent>
          <ImportarHorarioForm semanaInicioPorDefecto={inicio} />
        </CardContent>
      </Card>
    </div>
  );
}
