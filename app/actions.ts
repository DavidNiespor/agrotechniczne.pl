"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

const prisma = new PrismaClient();

async function getUser() {
  const session = await getServerSession();
  if (!session?.user?.email) return null;
  return await prisma.user.findUnique({ where: { email: session.user.email } });
}

// --- 1. POLA (FIELDS) ---
export async function addField(formData: FormData) {
  const user = await getUser();
  if (!user) return;

  await prisma.field.create({
    data: {
      userId: user.id,
      name: formData.get("name") as string,
      area: parseFloat(formData.get("area") as string),
      cropType: formData.get("cropType") as string,
    },
  });
  revalidatePath("/");
}

export async function deleteField(formData: FormData) {
  const id = formData.get("id") as string;
  await prisma.field.delete({ where: { id } });
  revalidatePath("/");
}

// --- 2. MAGAZYN (WAREHOUSE) ---
export async function addWarehouseItem(formData: FormData) {
  const user = await getUser();
  if (!user) return;

  await prisma.warehouseItem.create({
    data: {
      userId: user.id,
      name: formData.get("name") as string,
      quantity: parseFloat(formData.get("quantity") as string),
      unit: formData.get("unit") as string,
      batchNumber: formData.get("batchNumber") as string,
      expirationDate: new Date(formData.get("expirationDate") as string),
      productionDate: new Date(), // Opcjonalnie można dodać pole w formularzu
    },
  });
  revalidatePath("/");
}

export async function deleteWarehouseItem(formData: FormData) {
  const id = formData.get("id") as string;
  await prisma.warehouseItem.delete({ where: { id } });
  revalidatePath("/");
}

// --- 3. ZABIEGI (TREATMENTS) ---
export async function addTreatment(formData: FormData) {
  const user = await getUser();
  if (!user) return;

  const fieldId = formData.get("fieldId") as string;

  await prisma.treatment.create({
    data: {
      userId: user.id,
      date: new Date(formData.get("date") as string),
      crop: formData.get("crop") as string, // Uprawa
      area: parseFloat(formData.get("area") as string),
      temperature: parseFloat(formData.get("temperature") as string) || 0,
      windSpeed: parseFloat(formData.get("windSpeed") as string) || 0,
      fieldId: fieldId !== "none" ? fieldId : null,
    },
  });
  revalidatePath("/");
}

export async function deleteTreatment(formData: FormData) {
  const id = formData.get("id") as string;
  await prisma.treatment.delete({ where: { id } });
  revalidatePath("/");
}