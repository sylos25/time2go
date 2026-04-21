import { SignJWT, decodeProtectedHeader, jwtVerify, type JWTPayload } from "jose";
import { resolveJwtSecret } from "@/lib/jwt-secret";
import { isTokenJtiRevoked } from "@/lib/token-revocation";
import { isActiveSessionValid } from "@/lib/active-session";

export interface JwtPayload extends JWTPayload {
  id_usuario?: string | number;
  id_rol?: number;
  name?: string;
  sid?: string;
  token_type?: "access" | "refresh";
}

export type VerifyTokenFailureReason = "invalid" | "revoked" | "session_replaced";

export type VerifyTokenResult = {
  payload: JwtPayload | null;
  reason?: VerifyTokenFailureReason;
};

export function getJwtSecret(): string {
  return resolveJwtSecret();
}

function getSecretBytes(): Uint8Array {
  return new TextEncoder().encode(getJwtSecret());
}

function parseJwtKeysFromEnv(): Record<string, string> {
  const raw = process.env.JWT_KEYS || "";
  if (!raw.trim()) {
    return {};
  }

  try {
    const asJson = JSON.parse(raw) as Record<string, unknown>;
    const result: Record<string, string> = {};
    for (const [k, v] of Object.entries(asJson)) {
      if (k && typeof v === "string" && v.trim()) {
        result[k] = v.trim();
      }
    }
    return result;
  } catch {
    const result: Record<string, string> = {};
    for (const pair of raw.split(",")) {
      const [k, v] = pair.split(":");
      if (k?.trim() && v?.trim()) {
        result[k.trim()] = v.trim();
      }
    }
    return result;
  }
}

function getActiveKid(): string {
  return (process.env.JWT_ACTIVE_KID || "v1").trim();
}

function getSigningSecretAndKid(): { secret: Uint8Array; kid: string } {
  const keys = parseJwtKeysFromEnv();
  const activeKid = getActiveKid();
  const selectedSecret = keys[activeKid] || getJwtSecret();
  return {
    secret: new TextEncoder().encode(selectedSecret),
    kid: activeKid,
  };
}

function getSecretForKid(kid: string | undefined): Uint8Array | null {
  const keys = parseJwtKeysFromEnv();
  if (kid && keys[kid]) {
    return new TextEncoder().encode(keys[kid]);
  }

  if (!kid) {
    return getSecretBytes();
  }

  if (!Object.keys(keys).length) {
    return getSecretBytes();
  }

  return null;
}

function jwtIssuer(): string | undefined {
  return process.env.JWT_ISSUER || undefined;
}

function jwtAudience(): string | undefined {
  return process.env.JWT_AUDIENCE || undefined;
}

export async function verifyToken(
  token: string,
  expectedType: "access" | "refresh" = "access"
): Promise<JwtPayload | null> {
  const result = await verifyTokenDetailed(token, expectedType);
  return result.payload;
}

export async function verifyTokenDetailed(
  token: string,
  expectedType: "access" | "refresh" = "access"
): Promise<VerifyTokenResult> {
  try {
    const header = decodeProtectedHeader(token);
    const secret = getSecretForKid(typeof header.kid === "string" ? header.kid : undefined);
    if (!secret) {
      return { payload: null, reason: "invalid" };
    }

    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
      issuer: jwtIssuer(),
      audience: jwtAudience(),
    });

    if (!payload?.id_usuario) {
      return { payload: null, reason: "invalid" };
    }

    const tokenType = payload.token_type ? String(payload.token_type) : "access";
    if (tokenType !== expectedType) {
      return { payload: null, reason: "invalid" };
    }

    const typed: JwtPayload = {
      ...payload,
      id_usuario: String(payload.id_usuario),
      id_rol:
        payload.id_rol === undefined || payload.id_rol === null
          ? undefined
          : Number(payload.id_rol),
      name: payload.name ? String(payload.name) : undefined,
      sid: payload.sid ? String(payload.sid) : undefined,
      token_type: tokenType as "access" | "refresh",
    };

    if (typed.id_rol !== undefined && !Number.isFinite(typed.id_rol)) {
      return { payload: null, reason: "invalid" };
    }

    if (typed.name !== undefined && typed.name.trim() === "") {
      typed.name = undefined;
    }

    if (typed.jti) {
      const revoked = await isTokenJtiRevoked(String(typed.jti));
      if (revoked) {
        return { payload: null, reason: "revoked" };
      }
    }

    const activeSessionValid = await isActiveSessionValid(String(typed.id_usuario), typed.sid);
    if (!activeSessionValid) {
      return { payload: null, reason: "session_replaced" };
    }

    return { payload: typed };
  } catch {
    return { payload: null, reason: "invalid" };
  }
}

export async function signToken(payload: JwtPayload, expiresInSeconds = 60 * 60 * 12): Promise<string> {
  const { secret, kid } = getSigningSecretAndKid();
  const now = Math.floor(Date.now() / 1000);
  const tokenType = payload.token_type || "access";
  const jti = payload.jti ? String(payload.jti) : crypto.randomUUID();

  let token = new SignJWT({
    id_usuario: payload.id_usuario ? String(payload.id_usuario) : undefined,
    id_rol:
      payload.id_rol === undefined || payload.id_rol === null
        ? undefined
        : Number(payload.id_rol),
    name: payload.name ? String(payload.name) : undefined,
    sid: payload.sid ? String(payload.sid) : undefined,
    token_type: tokenType,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT", kid })
    .setJti(jti)
    .setIssuedAt(now)
    .setExpirationTime(now + expiresInSeconds);

  const issuer = jwtIssuer();
  if (issuer) {
    token = token.setIssuer(issuer);
  }

  const audience = jwtAudience();
  if (audience) {
    token = token.setAudience(audience);
  }

  return token.sign(secret);
}
