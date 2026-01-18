import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Brak danych logowania");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          throw new Error("Nieprawidłowy email lub hasło");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("Nieprawidłowe hasło");
        }

        // Zwracamy obiekt użytkownika (to co tu zwrócisz, trafi do tokena)
        return {
          id: user.id,
          email: user.email,
          fullName: user.fullName,     // <--- WAŻNE: Przekazujemy imię
          farmName: user.farmName,     // <--- WAŻNE: Przekazujemy nazwę farmy
          role: user.role,
        };
      }
    })
  ],
  callbacks: {
    // 1. Przepisujemy dane z bazy do tokena JWT
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.fullName = user.fullName;
        token.farmName = user.farmName;
      }
      return token;
    },
    // 2. Przepisujemy dane z tokena do sesji (którą widzi React)
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.fullName = token.fullName;
        session.user.farmName = token.farmName;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  }
});

export { handler as GET, handler as POST };