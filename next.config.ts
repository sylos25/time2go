import type { NextConfig } from "next";

/** Despliegue habitual: `next build` + `next start`. Export estático requiere `output: "export"` (ver docs de Next.js). */
const nextConfig: NextConfig = {
  images: {
    /** Necesario si sirves sin el optimizador de imágenes de Next (p. ej. export estático o CDN propio). */
    unoptimized: true,
  },
};

export default nextConfig;
