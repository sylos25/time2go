import { z } from "zod";

/** POST /api/login */
export const loginPostBodySchema = z.object({
  email: z.string().optional(),
  password: z.string().optional(),
  turnstileToken: z.union([z.string(), z.null()]).optional(),
});

/** POST /api/auth — registro vía RPC (ver comentario en la ruta) */
export const authRegisterBodySchema = z.object({
  email: z.string().min(1).email().max(320),
  password: z.string().min(1).max(256),
  nombres: z.union([z.string(), z.null()]).optional(),
  apellidos: z.union([z.string(), z.null()]).optional(),
  id_pais: z.union([z.number().int().positive(), z.string(), z.null()]).optional(),
  id_rol: z.union([z.number().int().min(1).max(99), z.string(), z.null()]).optional(),
});

/** POST /api/change-password */
export const changePasswordBodySchema = z.object({
  currentPassword: z.string().min(1).max(256),
  newPassword: z.string().min(1).max(256),
  confirmPassword: z.string().min(1).max(256),
});

export function parseOptionalNumericId(
  value: number | string | null | undefined
): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}
