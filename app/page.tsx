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

  const userData = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: {
      fields: true,
      warehouseItems: true,
      treatments: true,
    }
  });

  return (
    <FarmManager 
      initialFields={userData?.fields || []} 
      initialWarehouse={userData?.warehouseItems || []} 
      initialTreatments={userData?.treatments || []}
      userEmail={session.user.email}
    />
  );
}