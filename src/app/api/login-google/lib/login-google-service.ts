import { NextResponse } from "next/server";
import {
  createGoogleLoginUser,
  findGoogleLoginUser,
  findGoogleLoginUserById,
  syncExistingGoogleLoginUser,
} from "@/app/api/login-google/lib/login-google-repository";
import type {
  GoogleIdentity,
  GoogleLoginUser,
  GoogleTokenInfo,
} from "@/app/api/login-google/lib/login-google-types";

const GOOGLE_TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo";

export async function verifyGoogleIdentity(
  credential: string,
  clientId: string
): Promise<
  | { ok: true; identity: GoogleIdentity }
  | { ok: false; response: NextResponse }
> {
  const verifyRes = await fetch(
    `${GOOGLE_TOKENINFO_URL}?id_token=${encodeURIComponent(credential)}`
  );

  if (!verifyRes.ok) {
    return {
      ok: false,
      response: NextResponse.json({ message: "Token de Google invalido" }, { status: 401 }),
    };
  }

  const tokenInfo = (await verifyRes.json()) as GoogleTokenInfo;
  if (tokenInfo.aud !== clientId) {
    return {
      ok: false,
      response: NextResponse.json({ message: "Audience no valido" }, { status: 401 }),
    };
  }

  const emailVerified = tokenInfo.email_verified === true || tokenInfo.email_verified === "true";
  if (!emailVerified) {
    return {
      ok: false,
      response: NextResponse.json({ message: "Email de Google no verificado" }, { status: 403 }),
    };
  }

  const identity: GoogleIdentity = {
    googleId: String(tokenInfo.sub || "").trim(),
    email: String(tokenInfo.email || "").trim(),
    nombres: String(tokenInfo.given_name || "").trim(),
    apellidos: String(tokenInfo.family_name || "").trim(),
  };

  if (!identity.googleId || !identity.email) {
    return {
      ok: false,
      response: NextResponse.json({ message: "Datos de Google incompletos" }, { status: 400 }),
    };
  }

  return { ok: true, identity };
}

export async function resolveGoogleLoginUser(identity: GoogleIdentity): Promise<
  | { ok: true; user: GoogleLoginUser }
  | { ok: false; response: NextResponse }
> {
  const existingUser = await findGoogleLoginUser(identity.googleId, identity.email);

  if (existingUser) {
    if (existingUser.estado === false) {
      return {
        ok: false,
        response: NextResponse.json(
          {
            error: "Usuario baneado",
            message: "Tu cuenta está baneada temporalmente. Contacta al administrador.",
            banned: true,
          },
          { status: 403 }
        ),
      };
    }

    await syncExistingGoogleLoginUser(existingUser.id_usuario, identity);
    const refreshedUser = await findGoogleLoginUserById(existingUser.id_usuario);

    if (!refreshedUser) {
      return {
        ok: false,
        response: NextResponse.json(
          { message: "No fue posible resolver el usuario" },
          { status: 500 }
        ),
      };
    }

    return { ok: true, user: refreshedUser };
  }

  const createdUser = await createGoogleLoginUser(identity);
  if (!createdUser) {
    return {
      ok: false,
      response: NextResponse.json({ message: "No fue posible resolver el usuario" }, { status: 500 }),
    };
  }

  return { ok: true, user: createdUser };
}

export function resolveGoogleDisplayName(user: GoogleLoginUser): string {
  const storedName = typeof user.nombres === "string" ? user.nombres.trim() : "";
  if (storedName) return storedName;

  const emailName = String(user.correo || "").split("@")[0]?.trim();
  return emailName || "Usuario";
}
