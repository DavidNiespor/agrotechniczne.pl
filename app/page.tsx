// @ts-nocheck
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
// Usunąłem import komponentu, żeby nie było błędu ścieżki. Zrobimy to inline.
import { 
  addField, deleteField, 
  addWarehouseItem, deleteWarehouseItem, 
  addTreatment, deleteTreatment 
} from "./actions";

const prisma = new PrismaClient();

export default async function Dashboard() {
  const session = await getServerSession();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { 
      fields: true, 
      warehouseItems: true, 
      treatments: { include: { field: true } }
    }, 
  });

  if (!user) return <div>Błąd ładowania danych użytkownika.</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Witaj, {user.fullName || user.email}</h1>
          <p className="text-green-700 font-medium">{user.farmName || "Twoje Gospodarstwo"}</p>
        </div>
        <div className="mt-4 md:mt-0">
          <a href="/api/auth/signout" className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-bold">
             Wyloguj się
          </a>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* POLA */}
        <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4 text-green-800">🌱 Moje Pola</h2>
          <ul className="space-y-3 mb-6 max-h-60 overflow-y-auto">
            {user.fields.length === 0 ? <p className="text-gray-400 text-sm">Brak pól.</p> : user.fields.map(f => (
              <li key={f.id} className="bg-green-50 p-3 rounded flex justify-between items-center border border-green-100">
                <div><div className="font-bold text-sm">{f.name}</div><div className="text-xs text-gray-600">{f.area} ha | {f.cropType}</div></div>
                <form action={deleteField}><input type="hidden" name="id" value={f.id} /><button className="text-red-500 text-xs font-bold">USUŃ</button></form>
              </li>
            ))}
          </ul>
          <form action={addField} className="space-y-3 bg-gray-50 p-4 rounded border">
            <input name="name" placeholder="Nazwa" className="w-full p-2 text-sm border rounded" required />
            <div className="flex gap-2">
              <input name="area" type="number" step="0.01" placeholder="Ha" className="w-1/2 p-2 text-sm border rounded" required />
              <input name="cropType" placeholder="Uprawa" className="w-1/2 p-2 text-sm border rounded" required />
            </div>
            <button className="w-full bg-green-600 text-white py-2 rounded text-sm">Dodaj Pole</button>
          </form>
        </section>

        {/* MAGAZYN */}
        <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4 text-blue-800">📦 Magazyn</h2>
          <ul className="space-y-3 mb-6 max-h-60 overflow-y-auto">
            {user.warehouseItems.length === 0 ? <p className="text-gray-400 text-sm">Pusto.</p> : user.warehouseItems.map(item => (
              <li key={item.id} className="bg-blue-50 p-3 rounded flex justify-between items-center border border-blue-100">
                <div><div className="font-bold text-sm">{item.name}</div><div className="text-xs text-gray-600">{item.quantity} {item.unit}</div></div>
                <form action={deleteWarehouseItem}><input type="hidden" name="id" value={item.id} /><button className="text-red-500 text-xs font-bold">USUŃ</button></form>
              </li>
            ))}
          </ul>
          <form action={addWarehouseItem} className="space-y-3 bg-gray-50 p-4 rounded border">
            <input name="name" placeholder="Nazwa" className="w-full p-2 text-sm border rounded" required />
            <div className="flex gap-2">
              <input name="quantity" type="number" step="0.01" placeholder="Ilość" className="w-1/2 p-2 text-sm border rounded" required />
              <input name="unit" placeholder="Jedn." className="w-1/2 p-2 text-sm border rounded" required />
            </div>
            <div className="flex gap-2">
              <input name="batchNumber" placeholder="Nr partii" className="w-1/2 p-2 text-sm border rounded" />
              <input name="expirationDate" type="date" className="w-1/2 p-1 text-sm border rounded" required />
            </div>
            <button className="w-full bg-blue-600 text-white py-2 rounded text-sm">Dodaj</button>
          </form>
        </section>

        {/* ZABIEGI */}
        <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4 text-orange-800">🚜 Zabiegi</h2>
          <ul className="space-y-3 mb-6 max-h-60 overflow-y-auto">
            {user.treatments.length === 0 ? <p className="text-gray-400 text-sm">Brak.</p> : user.treatments.map(t => (
              <li key={t.id} className="bg-orange-50 p-3 rounded flex justify-between items-center border border-orange-100">
                <div><div className="font-bold text-sm">{new Date(t.date).toLocaleDateString()} - {t.crop}</div><div className="text-xs text-gray-600">{t.area} ha</div></div>
                <form action={deleteTreatment}><input type="hidden" name="id" value={t.id} /><button className="text-red-500 text-xs font-bold">USUŃ</button></form>
              </li>
            ))}
          </ul>
          <form action={addTreatment} className="space-y-3 bg-gray-50 p-4 rounded border">
             <div className="flex gap-2">
                 <input name="date" type="date" className="w-1/2 p-1 text-sm border rounded" required />
                 <select name="fieldId" className="w-1/2 p-1.5 text-sm border rounded">
                   <option value="none">-- Pole --</option>
                   {user.fields.map(f => (<option key={f.id} value={f.id}>{f.name}</option>))}
                 </select>
             </div>
            <input name="crop" placeholder="Uprawa" className="w-full p-2 text-sm border rounded" required />
            <input name="area" type="number" step="0.01" placeholder="Obszar" className="w-full p-2 text-sm border rounded" required />
            <div className="flex gap-2">
              <input name="temperature" type="number" placeholder="Temp" className="w-1/2 p-2 text-sm border rounded" />
              <input name="windSpeed" type="number" placeholder="Wiatr" className="w-1/2 p-2 text-sm border rounded" />
            </div>
            <button className="w-full bg-orange-600 text-white py-2 rounded text-sm">Zapisz</button>
          </form>
        </section>

      </div>
    </div>
  );
}