import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, fullName, farmName, farmAddress, piorinNumber } = body;

    if (!email || !password) {
      return NextResponse.json({ message: "Brak danych" }, { status: 400 });
    }

    // Hashowanie hasła
    const hashedPassword = await bcrypt.hash(password, 10);

    // Ustawienie daty wygaśnięcia licencji (30 dni od teraz)
    const trialExpires = new Date();
    trialExpires.setDate(trialExpires.getDate() + 30);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName: fullName || "",
        role: "USER",
        farmName: farmName || "",
        farmAddress: farmAddress || "",
        piorinNumber: piorinNumber || "",
        licenseStatus: "TRIAL",
        licenseExpiresAt: trialExpires, // Tu ustawiamy datę
      },
    });

    return NextResponse.json({ message: "Konto utworzone", user }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Błąd serwera" }, { status: 500 });
  }
}