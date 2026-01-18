// @ts-nocheck
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
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user || !(await bcrypt.compare(credentials.password, user.password))) {
          throw new Error("Błąd logowania");
        }
        return { id: user.id, email: user.email, fullName: user.fullName, farmName: user.farmName };
      }
    })
  ],
  // TO PRZYWRACA TWÓJ WYGLĄD LOGOWANIA
  pages: {
    signIn: '/login', 
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.id = user.id; token.farmName = user.farmName; }
      return token;
    },
    async session({ session, token }) {
      if (session.user) { session.user.id = token.id; session.user.farmName = token.farmName; }
      return session;
    }
  }
});

export { handler as GET, handler as POST };