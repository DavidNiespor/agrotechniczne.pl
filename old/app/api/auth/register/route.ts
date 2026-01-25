import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, fullName, farmName, farmAddress, piorinNumber } = body;

    if (!email || !password) {
      return NextResponse.json({ message: "Email i hasło są wymagane" }, { status: 400 });
    }

    // Sprawdzamy duplikaty
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: "Użytkownik już istnieje" }, { status: 409 });
    }

    // SZYFROWANIE HASŁA (Kluczowe dla logowania)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Data wygaśnięcia licencji (30 dni)
    const trialExpires = new Date();
    trialExpires.setDate(trialExpires.getDate() + 30);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword, // Zapisujemy zaszyfrowane!
        fullName: fullName || "",
        role: "USER",
        farmName: farmName || "",
        farmAddress: farmAddress || "",
        piorinNumber: piorinNumber || "",
        licenseStatus: "TRIAL",
        licenseExpiresAt: trialExpires,
      },
    });

    return NextResponse.json({ message: "Utworzono konto", user }, { status: 201 });

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ message: "Błąd serwera" }, { status: 500 });
  }
}