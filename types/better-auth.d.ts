import { Session } from "better-auth/react";

declare module "better-auth/react" {
  interface Session {
    user: {
      numero_documento: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
