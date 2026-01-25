// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Hasło", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        // Tu upewnij się, że masz weryfikację hasła (np. bcrypt.compare)
        return user;
      }
    })
  ],
  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user && token.sub) {
        session.user.id = token.sub; // <--- BEZ TEGO PRISMA NIE ZAPISZE POLA
      }
      return session;
    },
    jwt: async ({ token, user }) => {
      if (user) token.sub = user.id;
      return token;
    }
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Włącz debugowanie, żeby widzieć błędy w logach Dockera
};