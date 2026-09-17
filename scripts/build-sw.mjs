// Genera public/sw.js después de `next build`. No usamos @serwist/next
// porque depende de un plugin de Webpack, y este proyecto compila con
// Turbopack (el motor por defecto de Next.js 16). En vez de eso: esbuild
// empaqueta src/sw.ts a un script clásico (no ES module, por compatibilidad
// con Safari/iOS), y @serwist/build le inyecta la lista de precacheo.
import { build } from "esbuild";
import { injectManifest } from "@serwist/build";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const directorioTemp = mkdtempSync(path.join(tmpdir(), "turnia-sw-"));
const rutaEmpaquetada = path.join(directorioTemp, "sw.bundled.js");

try {
  await build({
    entryPoints: ["src/sw.ts"],
    bundle: true,
    outfile: rutaEmpaquetada,
    format: "iife",
    target: "es2020",
    minify: true,
  });

  const { count, size } = await injectManifest({
    swSrc: rutaEmpaquetada,
    swDest: "public/sw.js",
    globDirectory: "public",
    globPatterns: ["icons/**/*.png"],
  });

  console.log(`✓ Service worker generado en public/sw.js (${count} archivo(s) precacheados, ${size} bytes).`);
} finally {
  rmSync(directorioTemp, { recursive: true, force: true });
}
