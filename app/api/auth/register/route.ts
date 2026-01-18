
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, fullName, farmName, farmAddress, piorinNumber } = body;

    if (!email || !password) {
      return NextResponse.json({ message: 'Email i hasło są wymagane' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: 'Ten email jest już zajęty' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Ustawienie licencji TRIAL na 14 dni
    const trialExpires = new Date();
    trialExpires.setDate(trialExpires.getDate() + 14);

    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName: fullName || 'Rolnik',
        farmName,
        farmAddress,
        piorinNumber,
        role: 'USER',
        licenseStatus: 'TRIAL',
        licenseExpiresAt: trialExpires,
      },
    });

    return NextResponse.json({ message: 'Konto utworzone', userId: newUser.id }, { status: 201 });
  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ message: 'Błąd serwera' }, { status: 500 });
  }
}
