/*
import { FarmManager } from '../components/FarmManager';
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return <FarmManager />;
}
*/

// app/page.tsx
// @ts-nocheck
import { FarmManager } from '../components/FarmManager';
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // POBIERAMY PRAWDZIWE DANE DLA ZALOGOWANEGO UŻYTKOWNIKA
  const [dbFields, dbWarehouse] = await Promise.all([
    prisma.field.findMany({ where: { userId: session.user.id } }),
    prisma.warehouseItem.findMany({ where: { userId: session.user.id } })
  ]);

  return (
    <FarmManager 
      session={session} 
      initialFields={dbFields} 
      initialWarehouse={dbWarehouse} 
    />
  );
}