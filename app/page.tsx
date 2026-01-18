import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { UserNav } from "@/components/user-nav"; // Import przycisku wylogowania

export default async function Dashboard() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r flex flex-col justify-between">
        <div className="p-4 font-bold text-xl text-green-700">AgroSystem</div>
        
        {/* Tu wstawiamy nasz nowy przycisk wylogowania i dane usera */}
        <UserNav user={session.user} /> 
      </div>

      {/* Główna treść */}
      <div className="flex-1 p-8 bg-gray-50">
        <h1 className="text-3xl font-bold">Witaj, {session.user?.fullName}</h1>
        <p className="text-gray-600 mt-2">
          Twoje gospodarstwo: <span className="font-semibold">{session.user?.farmName || "Brak nazwy"}</span>
        </p>
      </div>
    </div>
  );
}