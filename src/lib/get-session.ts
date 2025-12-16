import { auth } from "./auth"
import { headers } from "next/headers"
import { verifyToken } from "./jwt"

export async function getSession() {
  const hdrs = await headers();
  const authHeader = hdrs.get('authorization') || '';

  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    const payload = verifyToken(token as string);
    if (payload && payload.numero_documento) {
      return { user: { numero_documento: payload.numero_documento, name: payload.name } } as any;
    }
  }

  const session = await auth.api.getSession({
    headers: hdrs,
  })

  return session
}
