import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Permite abrir el server de desarrollo desde el celular por la IP de la
  // red local (ej. para probar la app en un iPhone/Android real).
  allowedDevOrigins: ["192.168.1.89"],
};

export default withNextIntl(nextConfig);
