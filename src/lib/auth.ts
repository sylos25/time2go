import { betterAuth } from "better-auth";
import bcrypt from "bcrypt";

// Esto es del JWT.
    type JWTCallbackParams = {
        token: Record<string, any>;
        user?: { id_usuario: number };
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
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
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
        token.id_usuario = user.id_usuario;
      }
      return token;
    },
    async session({ session, token }: SessionCallbackParams) {
      if (token?.id) {
        session.user.id_usuario = token.id_usuario;
      }
      return session;
    },
  }
});