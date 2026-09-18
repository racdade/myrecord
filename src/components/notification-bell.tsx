"use client";

import { useEffect, useState } from "react";
import { Popover } from "@base-ui/react/popover";
import { Bell } from "lucide-react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import type { NotificationRow } from "@/types/database";

export function NotificationBell() {
  const t = useTranslations("notificaciones");
  const [notificaciones, setNotificaciones] = useState<NotificationRow[]>([]);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        setNotificaciones(data ?? []);
        setCargado(true);
      });
  }, []);

  const sinLeer = notificaciones.filter((n) => !n.leido);

  async function alAbrir(abierto: boolean) {
    if (!abierto || sinLeer.length === 0) return;
    const supabase = createClient();
    const ids = sinLeer.map((n) => n.id);
    setNotificaciones((actuales) => actuales.map((n) => (ids.includes(n.id) ? { ...n, leido: true } : n)));
    await supabase.from("notifications").update({ leido: true }).in("id", ids);
  }

  return (
    <Popover.Root onOpenChange={alAbrir}>
      <Popover.Trigger
        aria-label={t("titulo")}
        className="relative inline-flex size-8 shrink-0 items-center justify-center rounded-lg outline-none select-none hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <Bell className="size-4" aria-hidden="true" />
        {cargado && sinLeer.length > 0 && (
          <span className="absolute right-1 top-1 size-2 rounded-full bg-destructive" aria-hidden="true" />
        )}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner side="bottom" align="end" sideOffset={8} className="isolate z-50">
          <Popover.Popup className="w-80 max-w-[90vw] origin-(--transform-origin) rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
            <div className="border-b px-4 py-2.5 text-sm font-medium">{t("titulo")}</div>
            <div className="flex max-h-80 flex-col gap-1 overflow-y-auto p-2">
              {notificaciones.length === 0 ? (
                <p className="px-2 py-4 text-center text-sm text-muted-foreground">{t("vacio")}</p>
              ) : (
                notificaciones.map((n) => (
                  <div key={n.id} className="rounded-md px-2 py-2 text-sm">
                    <p className="whitespace-pre-wrap">{n.mensaje}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(n.created_at).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
