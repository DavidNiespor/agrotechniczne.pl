// @ts-nocheck
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../[...nextauth]/options"; // <--- NOWY IMPORT

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Błąd 401: Sesja wygasła" }, { status: 401 });
    }

    const data = await req.json();
    const field = await prisma.field.create({
      data: {
        userId: session.user.id,
        name: data.name,
        area: parseFloat(data.area),
        cropType: data.crop,
        parcelNumber: data.parcel || "",
      }
    });

    return NextResponse.json(field);
  } catch (error) {
    console.error("BŁĄD PRISMA:", error);
    return NextResponse.json({ error: "Błąd 500" }, { status: 500 });
  }
}