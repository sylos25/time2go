import { betterAuth } from "better-auth";
import bcrypt from "bcrypt";

// Esto es del JWT.
    type JWTCallbackParams = {
        token: Record<string, any>;
        user?: { numero_documento: string };
    };
    
    type SessionCallbackParams = {
        session: { user: Record<string, any> };
        token: Record<string, any>;
    };


export const auth = betterAuth({
  database: {
    provider: "postgresql",
    connectionString: process.env.DATABASE_URL as string,
  },

  secret: process.env.BETTER_AUTH_SECRET as string,

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
        token.numero_documento = (user as any).numero_documento || (user as any).numero_documento;
        // si el flujo de registro devuelve nombre, incluirlo en token
        if ((user as any).nombres) token.name = (user as any).nombres;
      }
      return token;
    },
    async session({ session, token }: SessionCallbackParams) {
      // exponer numero_documento y name en session.user si está en token
      if (token?.numero_documento) {
        session.user.numero_documento = token.numero_documento;
      }
      if ((token as any).name) {
        session.user.name = (token as any).name;
      }
      return session;
    },
  }
});