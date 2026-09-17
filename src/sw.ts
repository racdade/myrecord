/// <reference lib="webworker" />

// Service worker de Turnia. Solo precachea el puñado de íconos estáticos de
// public/icons — todo lo demás (páginas, /api, Server Actions) se deja pasar
// directo a la red sin interceptar. Esta es una app con datos dinámicos por
// usuario (turnos, autenticación); cachear agresivamente esas rutas es más
// riesgo (datos viejos, Server Actions mal cacheadas) que beneficio. Lo único
// que esto necesita resolver es el requisito de instalación de PWA: un
// service worker registrado con manejo de `fetch`.
import { Serwist, type PrecacheEntry } from "serwist";

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [],
});

serwist.addEventListeners();
