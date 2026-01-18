import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export default async function AdminUsersPage() {
  // Pobierz wszystkich użytkowników (nie adminów), sortuj od najnowszych
  const users = await prisma.user.findMany({
    where: { role: "USER" },
    orderBy: { createdAt: "desc" },
  });

  // Funkcja server action do przedłużania licencji
  async function extendLicense(formData: FormData) {
    "use server";
    const userId = formData.get("userId") as string;
    const months = Number(formData.get("months"));

    if (userId && months) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user && user.licenseExpiresAt) {
        const newDate = new Date(user.licenseExpiresAt);
        newDate.setMonth(newDate.getMonth() + months);
        
        await prisma.user.update({
          where: { id: userId },
          data: { 
            licenseExpiresAt: newDate,
            licenseStatus: "ACTIVE" 
          },
        });
        revalidatePath("/admin/users");
      }
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Panel Administratora - Licencje</h1>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Użytkownik</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Gospodarstwo</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Wygasa</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Akcja (+ Miesiące)</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{user.fullName || "Brak imienia"}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {user.farmName}<br/>{user.piorinNumber}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    new Date(user.licenseExpiresAt || "") < new Date() ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                  }`}>
                    {user.licenseExpiresAt ? user.licenseExpiresAt.toLocaleDateString() : "Brak"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  <form action={extendLicense} className="flex gap-2">
                    <input type="hidden" name="userId" value={user.id} />
                    <button name="months" value="1" className="bg-blue-100 text-blue-800 px-3 py-1 rounded hover:bg-blue-200">+1 msc</button>
                    <button name="months" value="12" className="bg-green-100 text-green-800 px-3 py-1 rounded hover:bg-green-200">+1 rok</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}