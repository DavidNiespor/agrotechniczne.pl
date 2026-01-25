import React, { useState } from 'react';
import { 
  Sprout, 
  Tractor, 
  User, 
  Pencil, 
  AlertTriangle, 
  Calendar, 
  CheckCircle2, 
  X,
  Save,
  ShieldCheck,
  Map
} from 'lucide-react';
import { cn, formatDate } from '../utils';

// --- TYPY DANYCH ---

interface Field {
  id: string;
  name: string;
  parcelNumber: string;
  area: number;
  crop: string;
}

interface Machine {
  id: string;
  name: string;
  capacity: number;
  inspectionDate: string;
}

interface UserData {
  name: string;
  chemAuthDate: string; // Data ważności uprawnień
}

// --- INITIAL MOCK DATA ---

const INITIAL_FIELDS: Field[] = [
  { id: '1', name: 'Działka za Domem', parcelNumber: '142/5', area: 5.40, crop: 'Pszenica ozima' },
  { id: '2', name: 'Klin pod Lasem', parcelNumber: '142/6', area: 2.15, crop: 'Rzepak' },
  { id: '3', name: 'Nowe Pole', parcelNumber: '188/2', area: 8.50, crop: 'Kukurydza' },
];

const INITIAL_MACHINES: Machine[] = [
  { id: '1', name: 'Opryskiwacz Pilmet 2500', capacity: 2500, inspectionDate: '2024-05-01' }, // Blisko terminu
  { id: '2', name: 'Ursus C-360', capacity: 0, inspectionDate: '2025-10-20' }, // OK
  { id: '3', name: 'Rozrzutnik', capacity: 4000, inspectionDate: '2023-12-15' }, // Przeterminowany
];

const INITIAL_USER: UserData = {
  name: 'Jan Kowalski',
  chemAuthDate: '2024-04-10', // Blisko terminu
};

export const Dashboard: React.FC = () => {
  // --- STATE ---
  const [fields, setFields] = useState<Field[]>(INITIAL_FIELDS);
  const [machines, setMachines] = useState<Machine[]>(INITIAL_MACHINES);
  const [user, setUser] = useState<UserData>(INITIAL_USER);

  // Modal Logic: { type: co edytujemy, id: id obiektu (opcjonalne) }
  const [modalState, setModalState] = useState<{ type: 'field' | 'machine' | 'user' | null, id?: string } | null>(null);
  
  // Temporary State for Forms
  const [tempCrop, setTempCrop] = useState('');
  const [tempDate, setTempDate] = useState('');

  // --- LOGIC: HELPERY ---

  // Obliczanie statusu daty (kolory)
  const getDateStatusColor = (dateStr: string) => {
    const today = new Date();
    const target = new Date(dateStr);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'text-red-700 bg-red-50 border-red-200';
    if (diffDays < 30) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  };

  const getDateStatusText = (dateStr: string) => {
    const today = new Date();
    const target = new Date(dateStr);
    if (target < today) return 'Wygasło!';
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 30) return `Wygasa za ${diffDays} dni`;
    return 'Ważne';
  };

  // --- LOGIC: HANDLERS ---

  const openFieldEdit = (field: Field) => {
    setTempCrop(field.crop);
    setModalState({ type: 'field', id: field.id });
  };

  const openMachineRenew = (machine: Machine) => {
    // Domyślnie ustawiamy datę na dzisiaj + rok, jako propozycja
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1); // Domyślnie +1 rok
    setTempDate(nextYear.toISOString().split('T')[0]);
    setModalState({ type: 'machine', id: machine.id });
  };

  const openUserAuthEdit = () => {
    setTempDate(user.chemAuthDate);
    setModalState({ type: 'user' });
  };

  const saveFieldChanges = () => {
    if (modalState?.type === 'field' && modalState.id) {
      setFields(fields.map(f => f.id === modalState.id ? { ...f, crop: tempCrop } : f));
      setModalState(null);
    }
  };

  const saveMachineRenewal = () => {
    if (modalState?.type === 'machine' && modalState.id) {
      setMachines(machines.map(m => m.id === modalState.id ? { ...m, inspectionDate: tempDate } : m));
      setModalState(null);
    }
  };

  const saveUserAuth = () => {
    setUser({ ...user, chemAuthDate: tempDate });
    setModalState(null);
  };

  return (
    <div className="space-y-8 pb-20">
      
      {/* --- SEKCJA 3: DANE ROLNIKA (Nagłówek) --- */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-800 border-2 border-white shadow-sm">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{user.name}</h1>
            <p className="text-slate-500">Gospodarstwo Rolne</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
           <div className={cn(
             "flex items-center gap-3 px-5 py-3 rounded-lg border",
             getDateStatusColor(user.chemAuthDate)
           )}>
              <ShieldCheck className="w-6 h-6 shrink-0" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wide opacity-80">Uprawnienia Chemizacyjne</p>
                <div className="flex items-center gap-2">
                   <span className="font-bold text-lg">{formatDate(user.chemAuthDate)}</span>
                   <button 
                     onClick={openUserAuthEdit}
                     className="ml-2 p-1.5 hover:bg-black/10 rounded-full transition-colors"
                     title="Aktualizuj uprawnienia"
                   >
                     <Pencil className="w-4 h-4" />
                   </button>
                </div>
              </div>
           </div>
        </div>
      </div>

      {/* --- SEKCJA 1: MOJE POLA --- */}
      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-5 flex items-center gap-2">
          <div className="p-2 bg-emerald-100 rounded text-emerald-800"><Map className="w-5 h-5"/></div>
          Moje Pola
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fields.map(field => (
            <div key={field.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="h-2 bg-emerald-500 w-full"></div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                   <div>
                     <h3 className="text-lg font-bold text-slate-800">{field.name}</h3>
                     <p className="text-sm text-slate-500 font-mono">Nr: {field.parcelNumber}</p>
                   </div>
                   <div className="text-right">
                     <span className="block text-2xl font-bold text-slate-800">{field.area}</span>
                     <span className="text-xs text-slate-400 font-medium uppercase">hektara</span>
                   </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                   <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Aktualna uprawa</span>
                      <span className="text-emerald-800 font-semibold text-sm bg-emerald-50 px-2 py-1 rounded inline-block mt-1">
                        {field.crop}
                      </span>
                   </div>
                   <button 
                     onClick={() => openFieldEdit(field)}
                     className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-slate-700 rounded-lg text-sm font-medium border border-gray-200 transition-colors"
                   >
                     <Pencil className="w-4 h-4" /> Edytuj
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- SEKCJA 2: PARK MASZYNOWY --- */}
      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-5 flex items-center gap-2">
          <div className="p-2 bg-amber-100 rounded text-amber-800"><Tractor className="w-5 h-5"/></div>
          Park Maszynowy
        </h2>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
           <div className="grid grid-cols-1 divide-y divide-gray-100">
             {machines.map(machine => {
                const statusColor = getDateStatusColor(machine.inspectionDate);
                const statusText = getDateStatusText(machine.inspectionDate);

                return (
                 <div key={machine.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                          <Tractor className="w-6 h-6" />
                       </div>
                       <div>
                          <h4 className="font-bold text-slate-800 text-lg">{machine.name}</h4>
                          <p className="text-sm text-slate-500">Pojemność: {machine.capacity > 0 ? `${machine.capacity} l` : 'Nie dotyczy'}</p>
                       </div>
                    </div>

                    <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg md:bg-transparent md:p-0">
                       <div className="text-right mr-2">
                          <p className="text-xs text-slate-400 font-bold uppercase">Badanie techniczne</p>
                          <p className={cn("font-mono font-bold text-sm", statusColor.split(' ')[0])}>
                            {formatDate(machine.inspectionDate)}
                          </p>
                          <p className={cn("text-[10px] font-bold mt-0.5 inline-block px-1.5 py-0.5 rounded", statusColor)}>
                             {statusText}
                          </p>
                       </div>
                       
                       <button 
                         onClick={() => openMachineRenew(machine)}
                         className="bg-white border border-gray-300 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all flex items-center gap-2"
                       >
                         <Calendar className="w-4 h-4" />
                         Odnów
                       </button>
                    </div>
                 </div>
                );
             })}
           </div>
        </div>
      </section>

      {/* --- MODALS --- */}
      {modalState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setModalState(null)}></div>
          
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative z-10 animate-in zoom-in-95 duration-200 overflow-hidden">
            
            {/* Modal Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800">
                 {modalState.type === 'field' && 'Zmiana Uprawy'}
                 {modalState.type === 'machine' && 'Odnowienie Badań'}
                 {modalState.type === 'user' && 'Aktualizacja Uprawnień'}
              </h3>
              <button onClick={() => setModalState(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                 <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
               
               {/* --- FIELD FORM --- */}
               {modalState.type === 'field' && (
                 <>
                   <p className="text-sm text-slate-600 mb-2">Wybierz, co aktualnie rośnie na tym polu:</p>
                   <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Rodzaj Uprawy</label>
                   <div className="relative">
                      <select 
                        value={tempCrop}
                        onChange={(e) => setTempCrop(e.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none appearance-none"
                      >
                        <option value="Pszenica ozima">Pszenica ozima</option>
                        <option value="Pszenica jara">Pszenica jara</option>
                        <option value="Rzepak">Rzepak</option>
                        <option value="Kukurydza">Kukurydza</option>
                        <option value="Burak cukrowy">Burak cukrowy</option>
                        <option value="Jęczmień">Jęczmień</option>
                        <option value="Żyto">Żyto</option>
                        <option value="Inne">Inne / Ugór</option>
                      </select>
                      <Sprout className="absolute right-3 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
                   </div>
                   <button onClick={saveFieldChanges} className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg shadow-md transition-all flex items-center justify-center gap-2">
                      <Save className="w-5 h-5" /> Zapisz zmianę
                   </button>
                 </>
               )}

               {/* --- MACHINE FORM --- */}
               {modalState.type === 'machine' && (
                 <>
                   <div className="bg-amber-50 p-3 rounded border border-amber-200 flex gap-3 items-start mb-4">
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-800">
                        Wprowadź datę ważności <strong>nowego</strong> badania technicznego. System automatycznie obliczy termin następnego przeglądu.
                      </p>
                   </div>
                   
                   <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nowa data ważności badania</label>
                   <input 
                     type="date" 
                     value={tempDate}
                     onChange={(e) => setTempDate(e.target.value)}
                     className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-slate-900 font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                   />
                   
                   <button onClick={saveMachineRenewal} className="w-full mt-4 bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-lg shadow-md transition-all flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-5 h-5" /> Potwierdź Odnowienie
                   </button>
                 </>
               )}

               {/* --- USER FORM --- */}
               {modalState.type === 'user' && (
                 <>
                   <p className="text-sm text-slate-600 mb-2">Po ukończeniu szkolenia chemizacyjnego, wprowadź nową datę ważności zaświadczenia.</p>
                   
                   <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Ważne do dnia</label>
                   <input 
                     type="date" 
                     value={tempDate}
                     onChange={(e) => setTempDate(e.target.value)}
                     className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                   />

                   <button onClick={saveUserAuth} className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg shadow-md transition-all flex items-center justify-center gap-2">
                      <ShieldCheck className="w-5 h-5" /> Zaktualizuj Uprawnienia
                   </button>
                 </>
               )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
};