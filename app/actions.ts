// @ts-nocheck
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

export async function addField(formData: FormData) {
  const user = await getUser();
  if (!user) return;

  await prisma.field.create({
    data: {
      userId: user.id,
      name: formData.get("name"),
      area: parseFloat(formData.get("area")),
      cropType: formData.get("cropType"),
    },
  });
  revalidatePath("/");
}

export async function deleteField(formData: FormData) {
  const id = formData.get("id");
  await prisma.field.delete({ where: { id } });
  revalidatePath("/");
}

export async function addWarehouseItem(formData: FormData) {
  const user = await getUser();
  if (!user) return;

  await prisma.warehouseItem.create({
    data: {
      userId: user.id,
      name: formData.get("name"),
      quantity: parseFloat(formData.get("quantity")),
      unit: formData.get("unit"),
      batchNumber: formData.get("batchNumber"),
      expirationDate: new Date(formData.get("expirationDate")),
      productionDate: new Date(),
    },
  });
  revalidatePath("/");
}

export async function deleteWarehouseItem(formData: FormData) {
  const id = formData.get("id");
  await prisma.warehouseItem.delete({ where: { id } });
  revalidatePath("/");
}

export async function addTreatment(formData: FormData) {
  const user = await getUser();
  if (!user) return;

  const fieldId = formData.get("fieldId");

  await prisma.treatment.create({
    data: {
      userId: user.id,
      date: new Date(formData.get("date")),
      crop: formData.get("crop"),
      area: parseFloat(formData.get("area")),
      temperature: parseFloat(formData.get("temperature")) || 0,
      windSpeed: parseFloat(formData.get("windSpeed")) || 0,
      fieldId: fieldId !== "none" ? fieldId : null,
    },
  });
  revalidatePath("/");
}

export async function deleteTreatment(formData: FormData) {
  const id = formData.get("id");
  await prisma.treatment.delete({ where: { id } });
  revalidatePath("/");
}