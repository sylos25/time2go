import { signToken } from "@/lib/jwt";

export const ACCESS_EXPIRES_IN = 15 * 60;
export const REFRESH_EXPIRES_IN = 7 * 24 * 60 * 60;

export type SessionTokenPairInput = {
  userId: string;
  roleId?: number;
  name?: string;
  sessionId: string;
};

export type SessionTokenPair = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

export async function createSessionTokenPair({
  userId,
  roleId,
  name,
  sessionId,
}: SessionTokenPairInput): Promise<SessionTokenPair> {
  const normalizedName = typeof name === "string" && name.trim().length > 0 ? name.trim() : undefined;

  const accessToken = await signToken(
    {
      id_usuario: userId,
      id_rol: roleId,
      name: normalizedName,
      sid: sessionId,
      token_type: "access",
    },
    ACCESS_EXPIRES_IN
  );

  const refreshToken = await signToken(
    {
      id_usuario: userId,
      id_rol: roleId,
      name: normalizedName,
      sid: sessionId,
      token_type: "refresh",
    },
    REFRESH_EXPIRES_IN
  );

  return {
    accessToken,
    refreshToken,
    expiresAt: Math.floor(Date.now() / 1000) + ACCESS_EXPIRES_IN,
  };
}
