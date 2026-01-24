// app/api/fields/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Jeśli tu wywali błąd w terminalu, znaczy że session jest null
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Brak autoryzacji - zaloguj się ponownie" }, { status: 401 });
    }

    const data = await req.json();

    const newField = await prisma.field.create({
      data: {
        userId: session.user.id,
        name: data.name,
        area: parseFloat(data.area),
        cropType: data.crop,
        parcelNumber: data.parcel || "",
      }
    });

    return NextResponse.json(newField);
  } catch (error) {
    // Sprawdź logi w terminalu (tam gdzie masz npm run dev) po kliknięciu zapisu!
    console.error("BŁĄD PRISMA:", error);
    return NextResponse.json({ error: "Błąd bazy danych (Internal Server Error)" }, { status: 500 });
  }
}