import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
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

  const { data: membresias } = await supabase.from("team_members").select("team_id").eq("user_id", user.id);
  const teamId = membresias?.[0]?.team_id;
  let equipo: { id: string; nombre: string } | null = null;
  if (teamId) {
    const { data: equipoRow } = await supabase.from("teams").select("id, nombre").eq("id", teamId).single();
    equipo = equipoRow ?? null;
  }

  const { data: feriados } = await supabase.from("holidays").select("fecha, nombre");

  const t = await getTranslations("turnosImportar");

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("titulo")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ImportarHorarioForm semanaInicioPorDefecto={inicio} equipo={equipo} feriados={feriados ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}
