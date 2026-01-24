// @ts-nocheck
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "401: Zaloguj się ponownie" }, { status: 401 });

    const data = await req.json();
    const field = await prisma.field.create({
      data: {
        userId: session.user.id,
        name: data.name,
        area: parseFloat(data.area) || 0,
        cropType: data.crop,
        parcelNumber: data.parcel || "",
      }
    });
    return NextResponse.json(field);
  } catch (error) {
    console.error("PRISMA ERROR:", error);
    return NextResponse.json({ error: "500: Błąd bazy" }, { status: 500 });
  }
}