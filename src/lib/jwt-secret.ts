/**
 * Secreto JWT compartido por API (Node) y middleware (Edge).
 * Sin dependencias de Node-only para poder importarse desde middleware.
 */
export function resolveJwtSecret(): string {
  const s = process.env.BETTER_AUTH_SECRET || process.env.JWT_SECRET || "";
  if (process.env.NODE_ENV === "production") {
    if (!s) {
      throw new Error("JWT_SECRET o BETTER_AUTH_SECRET es obligatorio en producción");
    }
    return s;
  }
  return s || "dev-secret";
}
