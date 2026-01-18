
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Logowanie",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "rolnik@demo.pl" },
        password: { label: "Hasło", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Wprowadź email i hasło");
        }

        // Pobranie użytkownika z bazy
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          throw new Error("Nie znaleziono użytkownika o takim adresie email");
        }

        // Weryfikacja hasła
        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!isValid) {
          throw new Error("Nieprawidłowe hasło");
        }

        // Sprawdzenie blokady
        if (user.licenseStatus === 'BLOCKED') {
          throw new Error("Konto zablokowane. Skontaktuj się z administratorem.");
        }

        // Zwracamy obiekt usera (będzie dostępny w callbacks)
        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role,
          farmName: user.farmName // Kluczowe dla UI
        };
      }
    })
  ],
  callbacks: {
    // Rozszerzamy token JWT o nasze niestandardowe pola
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.farmName = user.farmName;
      }
      return token;
    },
    // Rozszerzamy sesję (dostępną w useSession po stronie klienta)
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.farmName = token.farmName;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login', // Własna strona logowania
    error: '/login',  // Przekierowanie błędów
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dni
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
