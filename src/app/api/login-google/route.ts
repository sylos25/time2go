import { NextResponse } from "next/server";
import { setActiveSession } from "@/lib/active-session";
import { createSessionTokenPair } from "@/lib/auth-session";
import { appendSessionCookies, buildSessionCookies } from "@/lib/auth-session-http";
import { resolveGoogleDisplayName, resolveGoogleLoginUser, verifyGoogleIdentity } from "@/app/api/login-google/lib/login-google-service";
import { getGoogleClientId, parseGoogleCredential } from "@/app/api/login-google/lib/login-google-validation";

export async function POST(req: Request) {
  try {
    const parsedCredential = await parseGoogleCredential(req);
    if (!parsedCredential.ok) {
      return parsedCredential.response;
    }

    const clientId = getGoogleClientId();
    if (!clientId) {
      return NextResponse.json(
        { message: "Google Client ID no configurado" },
        { status: 500 }
      );
    }

    const verifiedIdentity = await verifyGoogleIdentity(parsedCredential.credential, clientId);
    if (!verifiedIdentity.ok) {
      return verifiedIdentity.response;
    }

    const resolvedUser = await resolveGoogleLoginUser(verifiedIdentity.identity);
    if (!resolvedUser.ok) {
      return resolvedUser.response;
    }

    const user = resolvedUser.user;
    const userId = String(user.id_usuario);
    const sessionId = crypto.randomUUID();
    const displayName = resolveGoogleDisplayName(user);

    const sessionTokens = await createSessionTokenPair({
      userId,
      roleId: user.id_rol,
      name: displayName,
      sessionId,
    });

    await setActiveSession(userId, sessionId, 7 * 24 * 60 * 60);

    const response = NextResponse.json(
      {
        success: true,
        id_publico: user.id_publico,
        id_rol: user.id_rol,
        expiresAt: sessionTokens.expiresAt,
        name: displayName,
      },
      { status: 200 }
    );

    return appendSessionCookies(response, buildSessionCookies(sessionTokens));
  } catch (err) {
    console.error("Login Google error:", err);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
