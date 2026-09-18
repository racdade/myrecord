/// <reference lib="webworker" />

// Service worker de Llankia. Solo precachea el puñado de íconos estáticos de
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
  // navigationPreload manda una petición de red en paralelo a cada
  // navegación para que un handler la reutilice; como no tenemos ningún
  // runtimeCaching que la consuma, solo generaba una segunda petición
  // "de más" a cada página — y en /auth/callback esa duplicada llegaba con
  // el mismo código de Google ya usado, rompiendo el login (PKCE es de un
  // solo uso). Sin runtimeCaching, no hay nada que se beneficie de esto.
  navigationPreload: false,
  runtimeCaching: [],
});

serwist.addEventListeners();
