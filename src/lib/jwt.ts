import jwt, { type SignOptions } from "jsonwebtoken";
import { resolveJwtSecret } from "@/lib/jwt-secret";

export interface JwtPayload {
  id_usuario?: string;
  id_rol?: number;
  name?: string;
  iat?: number;
  exp?: number;
}

export function getJwtSecret(): string {
  return resolveJwtSecret();
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const payload = jwt.verify(token, getJwtSecret()) as JwtPayload;
    return payload;
  } catch {
    return null;
  }
}

export function signToken(payload: object, expiresIn: string | number = "12h"): string {
  const options: SignOptions = { expiresIn: expiresIn as SignOptions["expiresIn"] };
  return jwt.sign(payload, getJwtSecret(), options);
}
