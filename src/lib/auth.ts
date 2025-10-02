import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "../app/generated/prisma"; 
import bcrypt from "bcrypt";
 
const prisma = new PrismaClient();

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        async hash(password: string) {
            return await bcrypt.hash(password, 10);
        },
        async verify(password: string, hash: string) {
            return await bcrypt.compare(password, hash);
        },
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
        facebook: { 
            clientId: process.env.FACEBOOK_CLIENT_ID as string, 
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string, 
        }, 
    },
});
