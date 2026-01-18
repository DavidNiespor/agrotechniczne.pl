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

  // Pobieramy dane z Twojej bazy danych
  const [fields, warehouse] = await Promise.all([
    prisma.field.findMany({
      where: { userId: session.user.id }
    }),
    prisma.warehouseItem.findMany({
      where: { userId: session.user.id }
    })
  ]);

  // Przekazujemy prawdziwe dane do komponentu
  return (
    <FarmManager 
      session={session} 
      initialFields={fields} 
      initialWarehouse={warehouse} 
    />
  );
}