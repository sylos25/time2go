import { getJwtPayloadLenient } from "@/lib/auth-request"

export type MisValoracionesAuthUser = {
  id_usuario: number
  name?: string | null
}

export async function getMisValoracionesAuthenticatedUser(
  req: Request
): Promise<MisValoracionesAuthUser | null> {
  const payload = await getJwtPayloadLenient(req)
  if (!payload?.id_usuario) return null

  return {
    id_usuario: Number(payload.id_usuario),
    name: payload.name,
  }
}
