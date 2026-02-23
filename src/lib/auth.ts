import { betterAuth } from "better-auth";
import bcrypt from "bcrypt";

// Esto es del JWT.
    type JWTCallbackParams = {
      token: Record<string, any>;
      user?: { id_usuario: string };
    };
    
    type SessionCallbackParams = {
        session: { user: Record<string, any> };
        token: Record<string, any>;
    };


let authInstance: ReturnType<typeof betterAuth> | null = null;

export function getAuth() {
  if (authInstance) {
    return authInstance;
  }

  const connectionString = process.env.DATABASE_URL;
  const secret = process.env.BETTER_AUTH_SECRET;

  if (!connectionString || !secret) {
    throw new Error("BetterAuth is not configured. Missing DATABASE_URL or BETTER_AUTH_SECRET.");
  }

  authInstance = betterAuth({
    database: {
      provider: "postgresql",
      connectionString,
    },

    secret,

    session: {
      // 30 minutos
      expiresIn: 60 * 30,
      // tiempo opcional para refresh interno
      updateAge: 60 * 5,
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60,
      },
    },

    emailAndPassword: {
      enabled: true,
      async hash(password: string) {
        return await bcrypt.hash(password, 10);
      },
      async verify(password: string, hash: string) {
        return await bcrypt.compare(password, hash);
      },
    },

    callbacks: {
      async jwt({ token, user }: JWTCallbackParams) {
        if (user) {
          token.id_usuario = (user as any).id_usuario || (user as any).numero_documento;
          // si el flujo de registro devuelve nombre, incluirlo en token
          if ((user as any).nombres) token.name = (user as any).nombres;
        }
        return token;
      },
      async session({ session, token }: SessionCallbackParams) {
        // exponer id_usuario y name en session.user si está en token
        if ((token as any)?.id_usuario || (token as any)?.numero_documento) {
          session.user.id_usuario = (token as any).id_usuario || (token as any).numero_documento;
        }
        if ((token as any).name) {
          session.user.name = (token as any).name;
        }
        return session;
      },
    }
  });

  return authInstance;
}