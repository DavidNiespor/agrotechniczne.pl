// @ts-nocheck
"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

async function getUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  return user?.id;
}

export async function addField(data: any) {
  const userId = await getUserId();
  if (!userId) return;

  await prisma.field.create({
    data: {
      userId,
      name: data.name,
      area: parseFloat(data.area),
      cropType: data.crop || "Nieznana",
      parcelNumber: data.parcelNumber || "",
    }
  });
  revalidatePath("/");
}

export async function addWarehouseItem(data: any) {
  const userId = await getUserId();
  if (!userId) return;

  await prisma.warehouseItem.create({
    data: {
      userId,
      name: data.name,
      quantity: parseFloat(data.quantity),
      unit: data.unit,
      batchNumber: data.batchNumber || "",
      expirationDate: new Date(data.expirationDate),
    }
  });
  revalidatePath("/");
}