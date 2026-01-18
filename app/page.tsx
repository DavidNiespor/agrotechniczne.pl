/*import { FarmManager } from '../components/FarmManager';
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return <FarmManager />;
}*/
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

  // Pobieramy dane zalogowanego użytkownika
  const userData = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      fields: true,
      warehouseItems: true,
      treatments: true,
    }
  });

  return (
    <main>
      {/* Pasek górny z wylogowaniem - prosty i niezawodny */}
      <div className="w-full bg-white border-b p-4 flex justify-between items-center shadow-sm print:hidden">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">System Zarządzania</span>
          <span className="text-green-700 font-extrabold">{userData?.farmName || session.user?.email}</span>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="hidden md:inline text-sm text-gray-500">{session.user?.email}</span>
          <a 
            href="/api/auth/signout" 
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-sm"
          >
            Wyloguj się
          </a>
        </div>
      </div>

      {/* Przekazanie danych do Twojego komponentu FarmManager */}
      <FarmManager 
        initialFields={userData?.fields || []} 
        initialWarehouse={userData?.warehouseItems || []} 
        initialTreatments={userData?.treatments || []} 
      />
    </main>
  );
}