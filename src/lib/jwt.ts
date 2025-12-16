import jwt from 'jsonwebtoken';

export interface JwtPayload {
  numero_documento?: string;
  name?: string;
  iat?: number;
  exp?: number;
}

const SECRET = process.env.BETTER_AUTH_SECRET || process.env.JWT_SECRET || 'dev-secret';

export function verifyToken(token: string): JwtPayload | null {
  try {
    const payload = jwt.verify(token, SECRET) as JwtPayload;
    return payload;
  } catch (err) {
    return null;
  }
}

export function signToken(payload: object, expiresIn: string | number = '30m') {
  // Tip: cast to any to avoid TS overload mismatches from @types/jsonwebtoken
  return jwt.sign(payload as any, SECRET as any, { expiresIn: expiresIn as any } as any) as string;
}
