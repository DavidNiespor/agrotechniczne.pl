import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Brak sesji" }, { status: 401 });

    const data = await req.json();
    const newField = await prisma.field.create({
      data: {
        userId: session.user.id,
        name: data.name,
        area: parseFloat(data.area),
        cropType: data.crop,
        parcelNumber: data.parcel,
      }
    });
    return NextResponse.json(newField);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}