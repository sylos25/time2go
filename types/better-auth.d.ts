import { Session } from "better-auth/react";

declare module "better-auth/react" {
  interface Session {
    user: {
      id_usuario: number;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
