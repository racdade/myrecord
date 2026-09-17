"use client";

import { useEffect } from "react";

/**
 * Registra public/sw.js (generado por scripts/build-sw.mjs). Solo en
 * producción: en dev ese archivo no existe (no corre el build), y no hace
 * falta el service worker para desarrollar.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.error("No se pudo registrar el service worker:", error);
    });
  }, []);

  return null;
}
