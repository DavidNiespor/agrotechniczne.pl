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

        // PORÓWNANIE HASŁA (To musi pasować do rejestracji)
        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("Nieprawidłowe hasło");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.fullName || user.email, // Ważne dla wyświetlania w UI
          role: user.role,
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET, // Upewnij się, że masz to w Env w Portainerze!
  pages: {
    signIn: "/login", // Jeśli masz customową stronę logowania
  }
});

export { handler as GET, handler as POST };