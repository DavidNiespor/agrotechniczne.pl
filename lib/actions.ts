
'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// --- HELPERS ---
async function getAuthUser() {
  const session = await getServerSession(authOptions);
  // @ts-ignore
  if (!session || !session.user?.id) return null;
  // @ts-ignore
  return session.user.id;
}

// --- FIELDS ---

export async function getFields() {
  const userId = await getAuthUser();
  if (!userId) return [];
  
  return await db.field.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createField(data: any) {
  const userId = await getAuthUser();
  if (!userId) throw new Error("Unauthorized");

  await db.field.create({
    data: {
      userId,
      name: data.name,
      parcelNumber: data.parcelNumber,
      area: parseFloat(data.area),
      areaCrop: parseFloat(data.area), // Domyślnie to samo
      currentCrop: data.crop
    }
  });
  
  revalidatePath('/'); // Odśwież widok
}

// --- WAREHOUSE ---

export async function getWarehouseItems() {
  const userId = await getAuthUser();
  if (!userId) return [];

  return await db.warehouseItem.findMany({
    where: { userId },
    orderBy: { expiryDate: 'asc' } // FIFO suggest
  });
}

// Przykład Server Action dla Utylizacji
export async function disposeItem(itemId: string) {
  const userId = await getAuthUser();
  if (!userId) throw new Error("Unauthorized");

  await db.warehouseItem.update({
    where: { id: itemId, userId }, // Security: ensure ownership
    data: {
      quantity: 0,
      isWaste: false,
      disposalDate: new Date(),
    }
  });
  
  revalidatePath('/');
}
