import { getAuth } from "./auth"
import { headers } from "next/headers"
import { verifyToken } from "./jwt"
import { parseCookies } from "./cookies"

export async function getSession() {
  const hdrs = await headers();
  const authHeader = hdrs.get('authorization') || '';

  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    const payload = verifyToken(token as string);
    const userId = payload?.id_usuario || payload?.numero_documento;
    if (payload && userId) {
      return { user: { id_usuario: userId, name: payload.name } } as any;
    }
  }

  // Fall back: check cookies for a token (server-side)
  const cookieHeader = hdrs.get('cookie')
  if (cookieHeader) {
    const cookies = parseCookies(cookieHeader)
    const token = cookies['token']
    if (token) {
      const payload = verifyToken(token as string)
      const userId = payload?.id_usuario || payload?.numero_documento
      if (payload && userId) {
        return { user: { id_usuario: userId, name: payload.name } } as any;
      }
    }
  }

  const session = await getAuth().api.getSession({
    headers: hdrs,
  })

  return session
}
