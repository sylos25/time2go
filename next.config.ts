import type { NextConfig } from "next";

/**
 * CSP orientativa para Next (scripts inline), Turnstile, Google OAuth, mapas/tiles y ePayco.
 * `connect-src`/`img-src` con https: amplían superficie; ajústalo si conoces todos los orígenes.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://accounts.google.com https://*.google.com https://checkout.epayco.co https://*.epayco.co",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https: wss: ws:",
  "frame-src 'self' https://challenges.cloudflare.com https://checkout.epayco.co https://*.epayco.co",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self)",
  },
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
];

/** Despliegue habitual: `next build` + `next start`. Export estático requiere `output: "export"` (ver docs de Next.js). */
const nextConfig: NextConfig = {
  images: {
    /** Necesario si sirves sin el optimizador de imágenes de Next (p. ej. export estático o CDN propio). */
    unoptimized: true,
    /** URLs absolutas de portadas de evento (S3/R2/Cloudinary, etc.). Añade tu dominio público si falta. */
    remotePatterns: [
      { protocol: "http", hostname: "localhost", pathname: "/**" },
      { protocol: "http", hostname: "127.0.0.1", pathname: "/**" },
      { protocol: "https", hostname: "*.amazonaws.com", pathname: "/**" },
      { protocol: "https", hostname: "*.r2.dev", pathname: "/**" },
      { protocol: "https", hostname: "*.cloudflarestorage.com", pathname: "/**" },
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
