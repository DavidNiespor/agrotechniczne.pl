// @ts-nocheck
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unatuthorized" }, { status: 401 });

  const data = await req.json();
  
  const field = await prisma.field.create({
    data: {
      userId: session.user.id,
      name: data.name,
      area: parseFloat(data.area),
      cropType: data.crop,
    }
  });

  return NextResponse.json(field);
}