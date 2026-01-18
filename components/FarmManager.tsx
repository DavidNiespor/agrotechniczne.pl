'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Sprout, 
  Tractor, 
  FlaskConical, 
  FileText, 
  Plus, 
  Trash2, 
  Pencil, 
  Save, 
  X, 
  CheckCircle2, 
  Droplets, 
  Wind, 
  Thermometer,
  Calendar,
  LayoutGrid,
  Check,
  AlertCircle,
  Printer,
  CloudSun,
  AlertTriangle,
  Search,
  Undo2,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Hourglass,
  Clock,
  Package,
  Archive,
  History,
  Recycle,
  Trash,
  Ban,
  Truck
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

type ChemType = 'Herbicyd' | 'Fungicyd' | 'Insektycyd' | 'Regulator' | 'Nawoz' | 'Adiuwant';

interface Chemical {
  id: string;
  name: string;
  type: ChemType;
  activeSubstance: string;
  crops: string;
  quantity: number;
  unit: string;
  recommendedDose: string;
  
  // Batch Management Fields
  batchNumber: string;       // Numer partii
  productionDate: string;    // Data przyjęcia/produkcji
  expiryDate: string;        // Data ważności
  authorizationDate?: string;// Data dopuszczenia do obrotu (opcjonalne)
  
  // Disposal (Utylizacja)
  disposalDate?: string;     // Data oddania opakowania do utylizacji (FINALNA)
  disposedAmount?: number;   // Ilość (resztki) przekazana do utylizacji (jeśli > 0 to znaczy, że nie zużyto na polu)
  isWastePending?: boolean;  // Flaga techniczna: oczekuje na odbiór
}

interface Machine {
  id: string;
  name: string;
  capacity: number;
  inspectionDate: string;
}

interface TreatmentItem {
  chemId: string; // Keeps reference to a representative ID (or purely for tracking)
  chemName: string; // We group by Name now
  dose: number;
  unit: string;
  totalQuantity: number;
  target: string;
}

interface FieldSnapshot {
  id: string;
  name: string;
  parcelNumber: string;
  area: number;
  crop: string;
}

interface Treatment {
  id: string;
  date: string;
  treatedFields: FieldSnapshot[]; 
  totalArea: number;
  machineName: string;
  machineId?: string; // Dodane dla odtworzenia stanu formularza
  items: TreatmentItem[];
  waterRate: number;
  weather: { temp: number; wind: number; humidity: number };
}

// --- GLOBALNA BAZA ŚRODKÓW (MOCK ADMIN DB) ---
const GLOBAL_PESTICIDE_DB = [
  { 
    name: 'Mospilan 20 SP', type: 'Insektycyd', 
    activeSubstance: 'Acetamipryd', crops: 'Rzepak, Ziemniak, Sadownicze', 
    recommendedDose: '0.2', unit: 'kg' 
  },
  { 
    name: 'Tebu 250 EW', type: 'Fungicyd', 
    activeSubstance: 'Tebukonazol', crops: 'Pszenica ozima, Rzepak', 
    recommendedDose: '1.0', unit: 'l' 
  },
  { 
    name: 'Chwastox Extra 300 SL', type: 'Herbicyd', 
    activeSubstance: 'MCPA', crops: 'Pszenica, Jęczmień, Żyto', 
    recommendedDose: '3.0', unit: 'l' 
  },
  { 
    name: 'Caryx 240 SL', type: 'Regulator', 
    activeSubstance: 'Mepikwat, Metkonazol', crops: 'Rzepak ozimy', 
    recommendedDose: '0.7 - 1.4', unit: 'l' 
  },
  { 
    name: 'Agravita Aktiv 48', type: 'Nawoz', 
    activeSubstance: 'NPK + Mikro', crops: 'Wszystkie uprawy', 
    recommendedDose: '2.0 - 5.0', unit: 'l' 
  }
];

// --- MOCK DATA ---

const INITIAL_FIELDS: Field[] = [
  { id: '1', name: 'Działka pod Lasem', parcelNumber: '142/5', area: 5.4, crop: 'Pszenica ozima' },
  { id: '2', name: 'Klin', parcelNumber: '142/6', area: 2.1, crop: 'Rzepak' },
  { id: '3', name: 'Za Stodołą', parcelNumber: '188/2', area: 8.5, crop: 'Kukurydza' },
  { id: '4', name: 'Łąka', parcelNumber: '190/1', area: 1.2, crop: 'Trawa' },
];

const INITIAL_WAREHOUSE: Chemical[] = [
  { 
    id: 'c1', name: 'Tebu 250 EW', type: 'Fungicyd', 
    activeSubstance: 'Tebukonazol', crops: 'Pszenica, Rzepak',
    quantity: 10, unit: 'l', recommendedDose: '0.6 - 1.0',
    batchNumber: 'BATCH-2023-A', productionDate: '2023-05-10', expiryDate: '2025-06-20'
  },
  { 
    id: 'c1-b', name: 'Tebu 250 EW', type: 'Fungicyd', 
    activeSubstance: 'Tebukonazol', crops: 'Pszenica, Rzepak',
    quantity: 5, unit: 'l', recommendedDose: '0.6 - 1.0',
    batchNumber: 'BATCH-2022-OLD', productionDate: '2022-11-01', expiryDate: '2024-05-01' // Kończy się
  },
  { 
    id: 'c2', name: 'Priaxor', type: 'Fungicyd',
    activeSubstance: 'Fluxapyroxad', crops: 'Zboża',
    quantity: 4.5, unit: 'l', recommendedDose: '0.75 - 1.5',
    batchNumber: 'PRX-998', productionDate: '2023-09-15', expiryDate: '2025-11-15'
  },
  { 
    id: 'c3', name: 'Mocznik', type: 'Nawoz',
    activeSubstance: 'Azot 46%', crops: 'Wszystkie',
    quantity: 400, unit: 'kg', recommendedDose: '10 - 25',
    batchNumber: 'N46-BIGBAG', productionDate: '2024-01-20', expiryDate: '2026-01-01'
  },
  {
    id: 'c4', name: 'Navigator 360 SL', type: 'Herbicyd',
    activeSubstance: 'Chlopyralid', crops: 'Rzepak',
    quantity: 0, unit: 'l', recommendedDose: '0.3',
    batchNumber: 'NAV-EMPTY', productionDate: '2023-02-10', expiryDate: '2025-05-01'
  },
  {
    id: 'c5', name: 'Mospilan 20 SP', type: 'Insektycyd',
    activeSubstance: 'Acetamipryd', crops: 'Rzepak',
    quantity: 0, unit: 'kg', recommendedDose: '0.2',
    batchNumber: 'MOS-UTIL-OLD', productionDate: '2022-01-01', expiryDate: '2024-01-01',
    disposalDate: '2024-06-01' // ZUTYLIZOWANO
  }
];

const INITIAL_MACHINES: Machine[] = [
  { id: '1', name: 'Pilmet 2500', capacity: 2500, inspectionDate: '2024-05-20' },
  { id: '2', name: 'Biardzki 600', capacity: 600, inspectionDate: '2023-11-10' },
];

// --- GŁÓWNY KOMPONENT ---

export const FarmManager: React.FC = () => {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<'treatment' | 'fields' | 'warehouse' | 'machines' | 'reports'>('treatment');
  
  const [fields, setFields] = useState<Field[]>(INITIAL_FIELDS);
  const [warehouse, setWarehouse] = useState<Chemical[]>(INITIAL_WAREHOUSE);
  const [machines, setMachines] = useState<Machine[]>(INITIAL_MACHINES);
  const [treatments, setTreatments] = useState<Treatment[]>([]);

  // EDITING STATE
  const [editingId, setEditingId] = useState<string | null>(null);
  const editingTreatment = useMemo(() => treatments.find(t => t.id === editingId), [treatments, editingId]);

  // WAREHOUSE UI STATE (EXPANSION)
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const toggleGroup = (name: string) => {
    setExpandedGroups(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  };

  const [showPendingDisposal, setShowPendingDisposal] = useState(true); // Default open for visibility
  const [showDisposalHistory, setShowDisposalHistory] = useState(false);

  // Modals
  const [modalOpen, setModalOpen] = useState<'field' | 'chemical' | 'machine' | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);

  // --- CRUD HANDLERS ---
  const handleSaveField = (item: Field) => {
    if (editingItem) setFields(fields.map(i => i.id === item.id ? item : i));
    else setFields([...fields, item]);
    setModalOpen(null);
  };
  const handleDeleteField = (id: string) => {
    if(confirm('Usunąć pole?')) setFields(fields.filter(i => i.id !== id));
  };

  const handleSaveChemical = (item: Chemical) => {
    if (editingItem) setWarehouse(warehouse.map(i => i.id === item.id ? item : i));
    else setWarehouse([...warehouse, item]);
    setModalOpen(null);
  };
  const handleDeleteChemical = (id: string) => {
    if(confirm('Usunąć tę partię środka z magazynu?')) setWarehouse(warehouse.filter(i => i.id !== id));
  };

  // --- WASTE MANAGEMENT LOGIC (DEBUGGED) ---

  /**
   * ETAP 1: PRZENIESIENIE DO ODPADÓW
   */
  const handleMoveToWaste = (item: Chemical, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const isNotEmpty = item.quantity > 0;
    const message = isNotEmpty
        ? `Czy potwierdzasz, że środek ${item.name} (${item.quantity} ${item.unit}) staje się odpadem?\n\nZostanie on przeniesiony do sekcji "Puste opakowania i Odpady" i będzie czekał na odbiór.`
        : `Czy chcesz przenieść puste opakowanie po ${item.name} do sekcji odpadów?`;

    if (window.confirm(message)) {
       setWarehouse(prevWarehouse => prevWarehouse.map(i => {
          if (i.id === item.id) {
             return {
                ...i,
                disposedAmount: item.quantity > 0 ? item.quantity : undefined,
                quantity: 0,
                isWastePending: true // Explicitly mark as pending
             };
          }
          return i;
       }));
    }
  };

  /**
   * ETAP 2: FINALIZACJA UTYLIZACJI (DEBUG VERSION)
   */
  const handleFinalizeDisposal = (id: string) => {
    console.log("DEBUG: KLIKNIĘTO ZUTYLIZUJ. ID:", id);

    if (!id) {
       console.error("DEBUG: BŁĄD - Brak ID!");
       alert("Błąd: Nie znaleziono identyfikatora partii.");
       return;
    }

    if (window.confirm('Potwierdź fizyczne przekazanie odpadów firmie utylizacyjnej.\n\nElement zostanie przeniesiony do HISTORII z dzisiejszą datą.')) {
       const today = new Date().toISOString().split('T')[0];

       setWarehouse(prevItems => {
          console.log("DEBUG: Aktualizacja stanu magazynowego...");
          return prevItems.map(item => {
             if (item.id === id) {
                console.log("DEBUG: Znaleziono element, ustawiam datę utylizacji:", item.name);
                return {
                   ...item,
                   quantity: 0, // Upewnij się że jest 0
                   isWastePending: false, // Zdejmij flagę oczekiwania
                   disposalDate: today // Ustaw datę (to przenosi do historii)
                };
             }
             return item;
          });
       });
    }
  };

  const handleSaveMachine = (item: Machine) => {
    if (editingItem) setMachines(machines.map(i => i.id === item.id ? item : i));
    else setMachines([...machines, item]);
    setModalOpen(null);
  };
  const handleDeleteMachine = (id: string) => {
    if(confirm('Usunąć maszynę?')) setMachines(machines.filter(i => i.id !== id));
  };

  // --- TREATMENT LOGIC (CREATE & UPDATE) ---
  const handleSaveTreatment = (t: Treatment) => {
    let currentWarehouse = [...warehouse];

    // SCENARIUSZ 1: EDYCJA
    if (editingId) {
       // 1. Znajdź stary zabieg
       const oldTreatment = treatments.find(tr => tr.id === editingId);
       if (oldTreatment) {
         currentWarehouse = currentWarehouse.map(chem => {
           const oldItem = oldTreatment.items.find(i => i.chemName === chem.name);
           if (oldItem) {
               // Restore (Simplified)
              return { ...chem, quantity: Number((chem.quantity + oldItem.totalQuantity).toFixed(2)) };
           }
           return chem;
         });
       }
       setTreatments(treatments.map(tr => tr.id === editingId ? { ...t, id: editingId } : tr));
       setEditingId(null);
    } 
    else {
       setTreatments([t, ...treatments]);
    }

    // 4. ZDEJMIJ nowy towar z magazynu (FIFO Logic Simulation)
    t.items.forEach(item => {
        let remainingToDeduct = item.totalQuantity;
        const matchingBatches = currentWarehouse
           .filter(c => c.name === item.chemName && c.quantity > 0)
           .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

        matchingBatches.forEach(batch => {
           if (remainingToDeduct <= 0) return;
           const deductAmount = Math.min(batch.quantity, remainingToDeduct);
           const mainIndex = currentWarehouse.findIndex(c => c.id === batch.id);
           
           if (mainIndex !== -1) {
              currentWarehouse[mainIndex] = {
                 ...currentWarehouse[mainIndex],
                 quantity: Number((currentWarehouse[mainIndex].quantity - deductAmount).toFixed(2))
              };
           }
           remainingToDeduct -= deductAmount;
        });
    });

    setWarehouse(currentWarehouse);
    setActiveTab('reports');
  };

  const handleEditClick = (id: string) => {
    setEditingId(id);
    setActiveTab('treatment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  // Helper dla dat ważności
  const getExpiryStatus = (dateStr: string) => {
    const today = new Date();
    const expiry = new Date(dateStr);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { color: 'text-red-600', icon: AlertTriangle, label: 'PRZETERMINOWANY' };
    if (diffDays < 180) return { color: 'text-red-600', icon: Hourglass, label: 'Kończy się' }; // < 6 mies
    return { color: 'text-slate-800', icon: CheckCircle2, label: 'OK' };
  };

  // --- WAREHOUSE LIST FILTERING & GROUPING ---

  // 1. Grouped Active Items (Hierarchy) -> Quantity > 0
  const groupedActiveItems = useMemo(() => {
    const active = warehouse.filter(i => i.quantity > 0);
    const groups: Record<string, { meta: Chemical, batches: Chemical[], totalQty: number }> = {};
    
    active.forEach(item => {
      if (!groups[item.name]) {
        groups[item.name] = { 
           meta: item, // representative metadata
           batches: [], 
           totalQty: 0 
        };
      }
      groups[item.name].batches.push(item);
      groups[item.name].totalQty += item.quantity;
    });

    return Object.values(groups);
  }, [warehouse]);

  // 2. Pending Disposal (Qty = 0, No Disposal Date)
  const pendingDisposalItems = warehouse.filter(i => i.quantity === 0 && !i.disposalDate);

  // 3. Disposal History (Qty = 0, Has Disposal Date)
  const disposalHistoryItems = warehouse.filter(i => i.quantity === 0 && i.disposalDate);


  return (
    <div className="bg-slate-100 min-h-screen pb-20 font-sans text-slate-900 print:bg-white print:pb-0">
      
      {/* HEADER (No Print) */}
      <div className="bg-white border-b border-gray-300 sticky top-0 z-20 shadow-md print:hidden">
        
        {/* MODUŁ POGODY AGROTECHNICZNEJ */}
        <WeatherWidget />

        <div className="max-w-7xl mx-auto px-4">
          <div className="py-4 flex justify-between items-center">
             <div>
               <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                 <Sprout className="w-8 h-8 text-green-600"/> 
                 <span>agrotechniczne<span className="text-green-600">.pl</span></span>
               </h1>
             </div>
             <div className="hidden md:flex items-center gap-4 text-sm font-medium">
                <span className="flex items-center gap-1"><FlaskConical className="w-4 h-4 text-blue-600"/> Magazyn: {groupedActiveItems.length} środków</span>
                <span className="flex items-center gap-1"><LayoutGrid className="w-4 h-4 text-green-600"/> Pola: {fields.length}</span>
             </div>
          </div>
          
          <nav className="flex gap-1 mt-2 overflow-x-auto pb-0 hide-scrollbar">
            <TabButton active={activeTab === 'treatment'} onClick={() => setActiveTab('treatment')} icon={Droplets} label={editingId ? "Edycja Zabiegu" : "1. Nowy Zabieg"} highlight={!!editingId} />
            <TabButton active={activeTab === 'fields'} onClick={() => setActiveTab('fields')} icon={LayoutGrid} label="2. Pola" />
            <TabButton active={activeTab === 'warehouse'} onClick={() => setActiveTab('warehouse')} icon={FlaskConical} label="3. Magazyn" />
            <TabButton active={activeTab === 'machines'} onClick={() => setActiveTab('machines')} icon={Tractor} label="4. Maszyny" />
            <TabButton active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} icon={FileText} label="5. Raporty" />
          </nav>
        </div>
      </div>

      {/* PRINT HEADER ONLY */}
      <div className="hidden print:block p-8 pb-0 text-center">
         <h1 className="text-3xl font-black text-slate-900 mb-2">AGROTECHNICZNE.PL</h1>
         <h2 className="text-xl text-slate-600 uppercase tracking-widest border-b-2 border-slate-900 pb-4 mb-8">Raport Ewidencji Zabiegów Ochrony Roślin</h2>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 print:p-0 print:max-w-full">
        
        {/* --- TAB 1: NOWY ZABIEG / EDYCJA --- */}
        {activeTab === 'treatment' && (
          <TreatmentCreator 
             fields={fields} 
             machines={machines} 
             warehouse={warehouse} // Pass ALL items for calculation, even empty if logic needs history
             onSave={handleSaveTreatment}
             initialData={editingTreatment} // Pass data for editing
             onCancel={handleCancelEdit}    // Cancel handler
          />
        )}

        {/* --- TAB 2: POLA --- */}
        {activeTab === 'fields' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex justify-between items-center">
              <SectionHeader title="Ewidencja Gruntów" desc="Zarządzaj swoimi działkami rolnymi." />
              <button onClick={() => { setEditingItem(null); setModalOpen('field'); }} className="btn-primary">
                <Plus className="w-5 h-5" /> Dodaj Pole
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {fields.map(field => (
                <FieldCard 
                  key={field.id} 
                  field={field} 
                  onEdit={() => { setEditingItem(field); setModalOpen('field'); }}
                  onDelete={() => handleDeleteField(field.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 3: MAGAZYN (ZARZĄDZANIE PARTIAMI) --- */}
        {activeTab === 'warehouse' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex justify-between items-center">
              <SectionHeader title="Magazyn Środków" desc="Zarządzanie partiami i utylizacja opakowań." />
              <button onClick={() => { setEditingItem(null); setModalOpen('chemical'); }} className="btn-primary bg-blue-600 hover:bg-blue-700">
                <Plus className="w-5 h-5" /> Dodaj Partię
              </button>
            </div>

            {/* --- 1. ACTIVE ITEMS TABLE (GROUPED) --- */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
               <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-bold border-b border-gray-200">
                    <tr>
                      <th className="p-4 w-10"></th>
                      <th className="p-4">Nazwa / Typ</th>
                      <th className="p-4">Dane Partii</th>
                      <th className="p-4">Ilość Łączna</th>
                      <th className="p-4 text-right">Akcje</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {groupedActiveItems.map(group => {
                       const isExpanded = expandedGroups.includes(group.meta.name);
                       return (
                        <React.Fragment key={group.meta.name}>
                          {/* PARENT ROW */}
                          <tr 
                            className="hover:bg-slate-50 cursor-pointer group transition-colors border-b border-gray-100 last:border-0" 
                            onClick={() => toggleGroup(group.meta.name)}
                          >
                            <td className="p-4 text-center">
                               <ChevronRight className={cn("w-5 h-5 text-slate-400 transition-transform", isExpanded && "rotate-90")} />
                            </td>
                            <td className="p-4">
                               <div className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                 {group.meta.name}
                                 {GLOBAL_PESTICIDE_DB.some(db => db.name === group.meta.name) && (
                                   <div title="Baza Globalna">
                                     <ShieldCheck className="w-5 h-5 text-green-600 fill-green-50" />
                                   </div>
                                 )}
                               </div>
                               <span className={cn(
                                 "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase mt-1 inline-block",
                                 group.meta.type === 'Herbicyd' ? "bg-red-100 text-red-800" :
                                 group.meta.type === 'Fungicyd' ? "bg-blue-100 text-blue-800" :
                                 group.meta.type === 'Insektycyd' ? "bg-amber-100 text-amber-800" :
                                 "bg-gray-100 text-gray-800"
                               )}>
                                 {group.meta.type}
                               </span>
                            </td>
                            <td className="p-4 text-sm text-slate-500">
                               <div>s.cz.: {group.meta.activeSubstance}</div>
                               <div className="mt-1 flex items-center gap-1 font-bold text-slate-600">
                                  <Package className="w-3 h-3"/> Liczba partii: {group.batches.length}
                               </div>
                            </td>
                            <td className="p-4">
                               <div className="text-2xl font-black text-blue-700">
                                 {group.totalQty.toFixed(2)} <span className="text-base font-normal text-slate-500">{group.meta.unit}</span>
                               </div>
                            </td>
                            <td className="p-4 text-right">
                               <button className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded hover:bg-blue-100">
                                  {isExpanded ? 'Zwiń' : 'Szczegóły'}
                               </button>
                            </td>
                          </tr>

                          {/* CHILD ROWS (BATCHES) */}
                          {isExpanded && group.batches.map(item => {
                             const expiry = getExpiryStatus(item.expiryDate);
                             return (
                               <tr key={item.id} className="bg-slate-50 hover:bg-slate-100 border-b border-gray-100 last:border-0 animate-in slide-in-from-top-1">
                                  <td className="p-4 border-l-4 border-blue-500"></td>
                                  <td className="p-4 pl-0">
                                     <div className="flex items-center gap-2 text-sm text-slate-500">
                                       <div className="w-6 h-px bg-slate-300"></div>
                                       <span>Partia:</span>
                                       <span className="font-mono bg-white border px-2 py-0.5 rounded font-bold text-slate-700">{item.batchNumber}</span>
                                     </div>
                                  </td>
                                  <td className="p-4">
                                     <div className={cn("flex items-center gap-2 font-bold text-sm", expiry.color)}>
                                        <expiry.icon className="w-4 h-4" />
                                        Ważność: {item.expiryDate}
                                     </div>
                                  </td>
                                  <td className="p-4 font-bold text-slate-700">
                                     {item.quantity} {item.unit}
                                  </td>
                                  <td className="p-4 text-right flex justify-end gap-2">
                                    <button 
                                       onClick={(e) => handleMoveToWaste(item, e)}
                                       className="icon-btn text-amber-600 bg-white border border-amber-200 hover:bg-amber-50 hover:border-amber-400"
                                       title="Przenieś do odpadów (Utylizacja)"
                                    >
                                       <Ban className="w-4 h-4"/>
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); setEditingItem(item); setModalOpen('chemical'); }} className="icon-btn text-blue-600 bg-white border border-blue-100"><Pencil className="w-4 h-4"/></button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteChemical(item.id); }} className="icon-btn text-red-600 bg-white border border-red-100"><Trash2 className="w-4 h-4"/></button>
                                  </td>
                               </tr>
                             )
                          })}
                        </React.Fragment>
                       );
                    })}
                  </tbody>
               </table>
               {groupedActiveItems.length === 0 && <EmptyState msg="Magazyn pusty. Dodaj partię." />}
            </div>

            {/* --- 2. PENDING DISPOSAL (EMPTY & NOT DISPOSED) --- */}
            {pendingDisposalItems.length > 0 && (
              <div className="mt-8">
                 <button 
                   onClick={() => setShowPendingDisposal(!showPendingDisposal)}
                   className="w-full flex items-center justify-between p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors border border-amber-200 mb-4 group"
                 >
                    <div className="flex items-center gap-3 font-bold text-amber-800">
                       <div className="bg-amber-200 p-1.5 rounded text-amber-800"><Recycle className="w-5 h-5"/></div>
                       <span>Puste opakowania i Odpady - Oczekujące na utylizację ({pendingDisposalItems.length})</span>
                    </div>
                    {showPendingDisposal ? <ChevronUp className="w-5 h-5 text-amber-600"/> : <ChevronDown className="w-5 h-5 text-amber-600"/>}
                 </button>
                 
                 {showPendingDisposal && (
                   <div className="bg-white border border-amber-200 rounded-xl overflow-hidden shadow-sm animate-in fade-in">
                      <table className="w-full text-left">
                          <tbody className="divide-y divide-amber-50">
                            {pendingDisposalItems.map(item => (
                              <tr key={item.id} className="hover:bg-amber-50/50">
                                <td className="p-4 align-top w-1/4">
                                  <div className="font-bold text-slate-800">{item.name}</div>
                                  <div className="text-xs uppercase text-slate-500">{item.type}</div>
                                </td>
                                <td className="p-4 align-top w-1/4">
                                  <div className="text-xs text-slate-500 mb-1">Nr Partii</div>
                                  <div className="font-mono text-sm font-bold">{item.batchNumber}</div>
                                </td>
                                <td className="p-4 align-top w-1/4">
                                   <div className="text-sm font-bold text-slate-400">
                                      0 {item.unit}
                                      {item.disposedAmount && item.disposedAmount > 0 ? (
                                         <span className="block text-xs font-bold text-amber-600 mt-1 bg-amber-50 p-1 rounded w-fit border border-amber-100">
                                            ODPAD (Zawartość): {item.disposedAmount} {item.unit}
                                         </span>
                                      ) : (
                                         <span className="text-xs font-normal ml-1">(ZUŻYTO)</span>
                                      )}
                                   </div>
                                </td>
                                <td className="p-4 align-top text-right">
                                   <button 
                                     onClick={(e) => {
                                       e.preventDefault();
                                       e.stopPropagation();
                                       handleFinalizeDisposal(item.id);
                                     }}
                                     className="bg-amber-100 hover:bg-amber-200 text-amber-800 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 ml-auto transition-colors shadow-sm border border-amber-200 hover:border-amber-300"
                                   >
                                      <Truck className="w-4 h-4"/> ODBIÓR ODPADU
                                   </button>
                                   <div className="mt-2 flex justify-end gap-2 text-[10px]">
                                     <button onClick={() => { setEditingItem(item); setModalOpen('chemical'); }} className="text-blue-600 hover:underline">Edytuj (Korekta)</button>
                                   </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                      </table>
                   </div>
                 )}
              </div>
            )}

            {/* --- 3. DISPOSAL HISTORY (EMPTY & DISPOSED) --- */}
            {disposalHistoryItems.length > 0 && (
              <div className="mt-4">
                 <button 
                   onClick={() => setShowDisposalHistory(!showDisposalHistory)}
                   className="w-full flex items-center justify-between p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors border border-gray-300 mb-4"
                 >
                    <div className="flex items-center gap-3 font-bold text-slate-600">
                       <div className="bg-gray-300 p-1.5 rounded text-gray-700"><History className="w-5 h-5"/></div>
                       <span>Historia utylizacji ({disposalHistoryItems.length})</span>
                    </div>
                    {showDisposalHistory ? <ChevronUp className="w-5 h-5 text-slate-500"/> : <ChevronDown className="w-5 h-5 text-slate-500"/>}
                 </button>
                 
                 {showDisposalHistory && (
                   <div className="bg-slate-50 border border-gray-200 rounded-xl overflow-hidden shadow-inner opacity-75 grayscale-[0.8] animate-in fade-in">
                      <table className="w-full text-left">
                          <thead className="bg-gray-100 text-xs uppercase text-gray-500 font-bold">
                             <tr>
                               <th className="p-3">Środek</th>
                               <th className="p-3">Nr Partii</th>
                               <th className="p-3">Status</th>
                               <th className="p-3">Data Utylizacji</th>
                               <th className="p-3 text-right">Akcje</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {disposalHistoryItems.map(item => (
                              <tr key={item.id} className="hover:bg-gray-100 text-slate-500">
                                <td className="p-3 align-middle font-medium">
                                  {item.name}
                                </td>
                                <td className="p-3 align-middle font-mono text-xs">
                                  {item.batchNumber}
                                </td>
                                <td className="p-3 align-middle text-xs">
                                   {item.disposedAmount && item.disposedAmount > 0 ? (
                                      <span className="font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded">
                                         ODPAD: {item.disposedAmount} {item.unit}
                                      </span>
                                   ) : (
                                      <span className="text-slate-400">Puste opakowanie</span>
                                   )}
                                </td>
                                <td className="p-3 align-middle">
                                   <div className="flex items-center gap-2 font-bold text-slate-700 bg-white px-2 py-1 rounded border border-gray-200 w-fit">
                                      <Trash className="w-3 h-3"/> {item.disposalDate}
                                   </div>
                                </td>
                                <td className="p-3 align-middle text-right">
                                  <button onClick={() => handleDeleteChemical(item.id)} className="text-red-600 text-xs font-bold hover:underline">USUŃ Z HISTORII</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                      </table>
                   </div>
                 )}
              </div>
            )}

          </div>
        )}

        {/* --- TAB 4: MASZYNY --- */}
        {activeTab === 'machines' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex justify-between items-center">
              <SectionHeader title="Park Maszynowy" desc="Opryskiwacze i ich atesty." />
              <button onClick={() => { setEditingItem(null); setModalOpen('machine'); }} className="btn-primary bg-slate-800 hover:bg-slate-900">
                <Plus className="w-5 h-5" /> Dodaj Maszynę
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {machines.map(m => (
                 <div key={m.id} className="bg-white p-5 rounded-xl border border-gray-200 flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center"><Tractor className="w-6 h-6 text-slate-600"/></div>
                       <div>
                          <h3 className="font-bold text-slate-900 text-lg">{m.name}</h3>
                          <p className="text-sm text-slate-500">{m.capacity} litrów</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <div className="text-xs text-slate-400 uppercase font-bold mb-1">Atest do</div>
                       <div className={cn("font-bold text-sm px-2 py-1 rounded inline-block", new Date(m.inspectionDate) < new Date() ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800")}>
                         {m.inspectionDate}
                       </div>
                       <div className="mt-2 flex justify-end gap-2">
                          <button onClick={() => { setEditingItem(m); setModalOpen('machine'); }} className="text-blue-600 text-xs font-bold hover:underline">EDYTUJ</button>
                          <button onClick={() => handleDeleteMachine(m.id)} className="text-red-600 text-xs font-bold hover:underline">USUŃ</button>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {/* --- TAB 5: RAPORTY (PIORiN COMPLIANT) --- */}
        {activeTab === 'reports' && (
          <ReportsModule 
            treatments={treatments} 
            warehouse={warehouse} 
            onEdit={handleEditClick} // Przekazanie funkcji edycji
          />
        )}

      </main>

      {/* --- MODALS --- */}
      {modalOpen === 'field' && (
        <Modal title={editingItem ? "Edytuj Pole" : "Nowe Pole"} onClose={() => setModalOpen(null)}>
           <FieldForm initialData={editingItem} onSubmit={handleSaveField} onCancel={() => setModalOpen(null)} />
        </Modal>
      )}
      {modalOpen === 'chemical' && (
        <Modal title={editingItem ? "Edytuj Środek (Partia)" : "Przyjęcie Partii do Magazynu"} onClose={() => setModalOpen(null)}>
           <ChemicalForm initialData={editingItem} onSubmit={handleSaveChemical} onCancel={() => setModalOpen(null)} />
        </Modal>
      )}
      {modalOpen === 'machine' && (
        <Modal title={editingItem ? "Edytuj Maszynę" : "Nowa Maszyna"} onClose={() => setModalOpen(null)}>
           <MachineForm initialData={editingItem} onSubmit={handleSaveMachine} onCancel={() => setModalOpen(null)} />
        </Modal>
      )}
    </div>
  );
};

// --- WEATHER WIDGET (HEADER) ---

const WeatherWidget = () => {
   // MOCK DATA (Zgodnie z zadaniem)
   const weather = { temp: 18, wind: 2, humidity: 65 };
   const isSafe = weather.wind <= 4 && weather.temp <= 25;

   return (
     <div className="bg-slate-900 text-white print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col sm:flex-row justify-between items-center text-sm">
           <div className="flex items-center gap-6">
              <span className="font-bold text-slate-400 uppercase text-xs tracking-wider">Pogoda (Lokalna)</span>
              <div className="flex items-center gap-4 font-mono">
                 <span className="flex items-center gap-1"><Thermometer className="w-4 h-4 text-red-400"/> {weather.temp}°C</span>
                 <span className="flex items-center gap-1"><Wind className="w-4 h-4 text-blue-400"/> {weather.wind} m/s</span>
                 <span className="flex items-center gap-1"><Droplets className="w-4 h-4 text-blue-300"/> {weather.humidity}%</span>
              </div>
           </div>
           
           <div className="mt-2 sm:mt-0">
             {isSafe ? (
               <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                 <CheckCircle2 className="w-3 h-3"/> OKNO POGODOWE OTWARTE
               </span>
             ) : (
               <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 animate-pulse">
                 <AlertTriangle className="w-3 h-3"/> NIEBEZPIECZNE WARUNKI
               </span>
             )}
           </div>
        </div>
     </div>
   );
};

// --- RAPORTS MODULE (FILTERS & PRINT - PIORiN COMPLIANT) ---

const ReportsModule = ({ treatments, warehouse, onEdit }: { treatments: Treatment[], warehouse: Chemical[], onEdit: (id: string) => void }) => {
   const [dateFrom, setDateFrom] = useState('');
   const [dateTo, setDateTo] = useState('');

   const filteredTreatments = treatments.filter(t => {
      if (dateFrom && new Date(t.date) < new Date(dateFrom)) return false;
      if (dateTo && new Date(t.date) > new Date(dateTo)) return false;
      return true;
   });

   const handlePrint = () => {
      window.print();
   };

   return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
         <div className="flex flex-col md:flex-row justify-between items-end gap-4 print:hidden">
            <div>
               <SectionHeader title="Raporty i Historia" desc="Ewidencja wykonanych zabiegów (Wymogi PIORiN)." />
               <div className="flex gap-4 mt-4">
                  <div>
                     <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Od daty</label>
                     <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="p-2 border border-gray-300 rounded text-sm bg-white"/>
                  </div>
                  <div>
                     <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Do daty</label>
                     <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="p-2 border border-gray-300 rounded text-sm bg-white"/>
                  </div>
               </div>
            </div>
            <button onClick={handlePrint} className="btn-primary bg-slate-800 hover:bg-black">
               <Printer className="w-5 h-5"/> DRUKUJ RAPORT (PDF)
            </button>
         </div>
         
         {/* SEKCJA DO DRUKU I PODGLĄDU - STYL URZĘDOWY (PAPER) */}
         <div className="bg-white p-4 md:p-8 rounded-none md:rounded-xl shadow-none md:shadow-sm border-0 md:border border-gray-200 print:border-0 print:p-0">
           
           {/* NAGŁÓWEK RAPORTU */}
           <div className="mb-6 border-b-2 border-black pb-4 text-center">
              <h1 className="text-2xl font-bold uppercase text-black">Ewidencja Zabiegów Ochrony Roślin</h1>
              <h2 className="text-sm font-bold text-slate-600 mt-1 uppercase tracking-widest">agrotechniczne.pl</h2>
              <div className="mt-4 text-left text-sm flex justify-between">
                 <div>
                    <span className="font-bold">Gospodarstwo:</span> Jan Kowalski<br/>
                    <span className="font-bold">Adres:</span> Wiejska 1, 00-001 Rolniczowo
                 </div>
                 <div className="text-right">
                    <span className="font-bold">Rok zbioru:</span> {new Date().getFullYear()}<br/>
                    <span className="font-bold">Data wydruku:</span> {new Date().toLocaleDateString()}
                 </div>
              </div>
           </div>

           {/* TABELA URZĘDOWA */}
           <div className="overflow-x-auto">
             <table className="w-full text-sm border-collapse border border-gray-400">
                <thead className="bg-gray-100 text-black text-xs font-bold uppercase">
                   <tr>
                     <th className="border border-gray-400 p-2 text-left w-24">Data</th>
                     <th className="border border-gray-400 p-2 text-left">Nr i Nazwa Pola</th>
                     <th className="border border-gray-400 p-2 text-left w-24">Uprawa</th>
                     <th className="border border-gray-400 p-2 text-center w-16">Pow.<br/>(ha)</th>
                     <th className="border border-gray-400 p-2 text-left">Środek / Dawka / Substancja Czynna</th>
                     <th className="border border-gray-400 p-2 text-left w-32">Cel / Uwagi</th>
                     {/* COL: AKCJE (UKRYTA W DRUKU) */}
                     <th className="border border-gray-400 p-2 text-center w-10 print:hidden">Akcje</th>
                   </tr>
                </thead>
                <tbody className="text-black">
                   {/* FLAT MAP - Rozbijamy zabieg na pojedyncze pola, 1 Wiersz = 1 Pole */}
                   {filteredTreatments.flatMap((treatment) => 
                      treatment.treatedFields.map((field) => (
                        <tr key={`${treatment.id}-${field.id}`} className="break-inside-avoid hover:bg-gray-50 group">
                           <td className="border border-gray-400 p-2 align-top">
                              <strong>{treatment.date}</strong>
                              <div className="text-xs text-gray-500 mt-1">
                                Temp: {treatment.weather.temp}°C<br/>
                                Wiatr: {treatment.weather.wind} m/s
                              </div>
                           </td>
                           <td className="border border-gray-400 p-2 align-top">
                              <div className="font-bold text-xs uppercase text-gray-500">{field.parcelNumber}</div>
                              <div>{field.name}</div>
                           </td>
                           <td className="border border-gray-400 p-2 align-top">
                              {field.crop}
                           </td>
                           <td className="border border-gray-400 p-2 align-top text-center font-bold">
                              {field.area.toFixed(2)}
                           </td>
                           <td className="border border-gray-400 p-2 align-top">
                              <ul className="space-y-3">
                                {treatment.items.map((item, idx) => {
                                  // Find chemical in warehouse to get active substance
                                  // NOTE: We find by Name now because batch doesn't matter for the Report Display
                                  const chemInfo = warehouse.find(c => c.name === item.chemName);
                                  return (
                                    <li key={idx} className="border-b border-gray-200 pb-2 last:border-0 last:pb-0">
                                       <div className="flex justify-between font-bold">
                                          <span>{item.chemName}</span>
                                          <span>{item.dose} {item.unit}/ha</span>
                                       </div>
                                       {chemInfo && (
                                         <div className="text-xs italic text-gray-600 mt-0.5">
                                            s.cz.: {chemInfo.activeSubstance}
                                         </div>
                                       )}
                                    </li>
                                  )
                                })}
                              </ul>
                              <div className="mt-2 pt-2 border-t border-gray-300 text-xs text-gray-500">
                                 Woda: {treatment.waterRate} l/ha<br/>
                                 Sprzęt: {treatment.machineName}
                              </div>
                           </td>
                           <td className="border border-gray-400 p-2 align-top text-xs">
                              <ul className="space-y-3">
                                {treatment.items.map((item, idx) => (
                                  <li key={idx} className="border-b border-gray-200 pb-2 last:border-0 last:pb-0 min-h-[2.5em] flex items-center">
                                    {item.target}
                                  </li>
                                ))}
                              </ul>
                           </td>
                           {/* CELL: AKCJE (UKRYTA W DRUKU) */}
                           <td className="border border-gray-400 p-2 align-middle text-center print:hidden">
                              <button 
                                onClick={() => onEdit(treatment.id)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                title="Edytuj zabieg"
                              >
                                 <Pencil className="w-4 h-4" />
                              </button>
                           </td>
                        </tr>
                      ))
                   )}
                   {filteredTreatments.length === 0 && (
                      <tr><td colSpan={7} className="p-8 text-center text-gray-500 italic">Brak zabiegów w wybranym okresie.</td></tr>
                   )}
                </tbody>
             </table>
           </div>

           <div className="mt-8 pt-4 border-t border-gray-300 text-xs text-center text-gray-500 hidden print:block">
              Dokument wygenerowany elektronicznie. Spełnia wymogi ewidencji zabiegów ochrony roślin (Art. 34 Ustawy o środkach ochrony roślin).
           </div>
         </div>
      </div>
   );
};

// --- KOMPONENTY ZABIEGU (TREATMENT CREATOR - UPDATED FOR EDITING) ---

const TreatmentCreator = ({ fields, machines, warehouse, onSave, initialData, onCancel }: any) => {
   // STEP 1: Context
   const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
   const [selectedFieldIds, setSelectedFieldIds] = useState<string[]>([]);
   const [temp, setTemp] = useState(15);
   const [wind, setWind] = useState(2);
   const [humidity, setHumidity] = useState(65);

   // STEP 2: Machine & Calc
   const [selectedMachineId, setSelectedMachineId] = useState('');
   const [waterRate, setWaterRate] = useState(200); // l/ha

   // STEP 3: Mix
   const [mixItems, setMixItems] = useState<TreatmentItem[]>([]);
   
   // Form Add Mix Item
   const [addChemName, setAddChemName] = useState(''); // Changed from ID to Name for grouping
   const [addDose, setAddDose] = useState('');
   const [addTarget, setAddTarget] = useState('');

   // --- INITIALIZATION EFFECT (FOR EDITING) ---
   useEffect(() => {
     if (initialData) {
       setDate(initialData.date);
       // Use snapshot data or just IDs if fields exist. Since we have IDs, we map them back.
       setSelectedFieldIds(initialData.treatedFields.map((f: any) => f.id));
       setTemp(initialData.weather.temp);
       setWind(initialData.weather.wind);
       setHumidity(initialData.weather.humidity);
       // Try to match machine by name if ID missing (legacy), or ID if available
       const matchedMachine = machines.find((m: any) => m.id === initialData.machineId || m.name === initialData.machineName);
       if (matchedMachine) setSelectedMachineId(matchedMachine.id);
       setWaterRate(initialData.waterRate);
       setMixItems(initialData.items);
     } else {
       // Reset fields if switching to create mode (optional, mostly handled by unmount/mount)
       // But good practice if component stays mounted
       setDate(new Date().toISOString().split('T')[0]);
       setSelectedFieldIds([]);
       setMixItems([]);
       setSelectedMachineId('');
       setWaterRate(200);
     }
   }, [initialData, machines]);


   // --- DERIVED STATE ---
   const selectedFields = useMemo(() => fields.filter((f: Field) => selectedFieldIds.includes(f.id)), [fields, selectedFieldIds]);
   const totalArea = useMemo(() => selectedFields.reduce((sum: number, f: Field) => sum + f.area, 0), [selectedFields]);
   const selectedMachine = machines.find((m: Machine) => m.id === selectedMachineId);
   
   // Calculator
   const totalWater = totalArea * waterRate;
   const tanksNeeded = selectedMachine && selectedMachine.capacity > 0 ? Math.ceil(totalWater / selectedMachine.capacity) : 0;
   
   // AGGREGATED WAREHOUSE STOCK (Sum by Name)
   const aggregatedWarehouse = useMemo(() => {
      const agg: Record<string, { total: number, unit: string, sampleId: string }> = {};
      warehouse.forEach((c: Chemical) => {
         if (!agg[c.name]) {
            agg[c.name] = { total: 0, unit: c.unit, sampleId: c.id };
         }
         agg[c.name].total += c.quantity;
      });
      return agg;
   }, [warehouse]);

   // Selected Chemical Metadata (from first found match)
   const selectedChemMeta = warehouse.find((c: Chemical) => c.name === addChemName);
   const selectedChemStock = aggregatedWarehouse[addChemName]?.total || 0;

   // Validation Logic (Global Shortage Check - Aggregated)
   const hasGlobalShortage = useMemo(() => {
     return mixItems.some(item => {
        const inStock = aggregatedWarehouse[item.chemName]?.total || 0;
        return !initialData && item.totalQuantity > inStock; 
     });
   }, [mixItems, aggregatedWarehouse, initialData]);

   // Handlers
   const toggleField = (id: string) => {
      setSelectedFieldIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
   };

   // AUTO-UPDATE MIX ITEMS WHEN AREA CHANGES (New Requirement: Auto-Recalculate)
   useEffect(() => {
     if (mixItems.length > 0) {
       setMixItems(prevItems => prevItems.map(item => ({
         ...item,
         totalQuantity: Number((item.dose * totalArea).toFixed(2)) // Keep precision
       })));
     }
   }, [totalArea]);

   const addMixItem = () => {
      if (!selectedChemMeta || !addDose || !addTarget) return; 
      const doseNum = Number(addDose);
      const totalQ = doseNum * totalArea;
      
      setMixItems([...mixItems, {
         chemId: selectedChemMeta.id, // Just a reference ID (first found batch)
         chemName: selectedChemMeta.name,
         dose: doseNum,
         unit: selectedChemMeta.unit,
         totalQuantity: totalQ,
         target: addTarget
      }]);
      setAddChemName('');
      setAddDose('');
      setAddTarget('');
   };

   // NEW: Handle In-line Dose Editing
   const handleUpdateDose = (index: number, newDoseVal: string) => {
      const newDose = parseFloat(newDoseVal);
      if (isNaN(newDose) || newDose < 0) return; 

      setMixItems(prevItems => prevItems.map((item, i) => {
         if (i === index) {
            return {
               ...item,
               dose: newDose,
               totalQuantity: newDose * totalArea
            };
         }
         return item;
      }));
   };

   const handleFinalSave = () => {
      if (selectedFieldIds.length === 0) return alert('Wybierz przynajmniej jedno pole!');
      if (!selectedMachineId) return alert('Wybierz maszynę!');
      if (mixItems.length === 0) return alert('Dodaj środki do mieszaniny!');
      
      // Strict check only for new entries
      if (!initialData && hasGlobalShortage) return alert('Nie można zapisać! Brak towaru w magazynie.');

      onSave({
         id: Math.random().toString(), // ID will be overwritten in handleSave if editing
         date,
         treatedFields: selectedFields, 
         machineId: selectedMachineId, // Save ID for easier editing later
         machineName: selectedMachine?.name || '?',
         items: mixItems,
         waterRate,
         weather: { temp, wind, humidity }
      });
      
      // Clear local state if not unmounted immediately (though parent switches tab)
      if (!initialData) {
        setSelectedFieldIds([]);
        setMixItems([]);
      }
   };

   return (
     <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-in fade-in">
        
        {/* KOLUMNA 1: KONTEKST (Pola, Data) - SZEROKOŚĆ 4/12 */}
        <div className="xl:col-span-4 space-y-6">
           
           {/* HEADER DLA TRYBU EDYCJI */}
           {initialData ? (
             <div className="bg-amber-100 border border-amber-300 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <Pencil className="w-6 h-6 text-amber-700" />
                   <div>
                      <h3 className="font-bold text-amber-900">Tryb Edycji</h3>
                      <p className="text-xs text-amber-800">Modyfikujesz istniejący zabieg.</p>
                   </div>
                </div>
                <button onClick={onCancel} className="bg-white hover:bg-amber-50 text-amber-800 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm border border-amber-200">
                   ANULUJ
                </button>
             </div>
           ) : (
             <div className="panel p-0 overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-gray-200">
                   <h3 className="font-bold text-slate-800 flex items-center gap-2"><LayoutGrid className="w-4 h-4 text-green-600"/> 1. Wybierz Pola (Multi-Select)</h3>
                </div>
                {/* Content handled below to reuse code */}
             </div>
           )}

           {/* LISTA PÓŁ (REUSED) */}
           <div className={cn("panel p-0 overflow-hidden", initialData ? "border-amber-300" : "")}>
              {!initialData && (
                 // Already rendered header above for non-edit mode, but need list structure
                 <></> 
              )}
              {initialData && (
                 <div className="p-4 bg-amber-50 border-b border-amber-200">
                    <h3 className="font-bold text-amber-900 flex items-center gap-2"><LayoutGrid className="w-4 h-4"/> 1. Pola (Edycja)</h3>
                 </div>
              )}
              
              <div className="p-4 grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
                 {fields.map((f: Field) => {
                    const isSelected = selectedFieldIds.includes(f.id);
                    return (
                       <div 
                         key={f.id}
                         onClick={() => toggleField(f.id)}
                         className={cn(
                            "cursor-pointer rounded-lg border-2 p-3 transition-all relative",
                            isSelected 
                               ? (initialData ? "bg-amber-100 border-amber-500 shadow-sm" : "bg-green-50 border-green-500 shadow-sm")
                               : "bg-white border-gray-100 hover:border-green-200"
                         )}
                       >
                          {isSelected && <div className={cn("absolute top-2 right-2", initialData ? "text-amber-600" : "text-green-600")}><CheckCircle2 className="w-5 h-5 fill-current opacity-20"/></div>}
                          <div className="text-sm font-bold text-slate-900">{f.name}</div>
                          <div className="text-xs text-slate-500 mt-1">{f.crop}</div>
                          <div className="mt-2 text-xs font-bold bg-white/50 inline-block px-2 py-1 rounded border border-black/5">
                             {f.area} ha
                          </div>
                       </div>
                    );
                 })}
              </div>

              <div className={cn("p-4 border-t flex justify-between items-center", initialData ? "bg-amber-100 border-amber-200" : "bg-green-50 border-green-100")}>
                 <div className={cn("text-xs font-bold uppercase", initialData ? "text-amber-800" : "text-green-800")}>Wybrano: {selectedFieldIds.length}</div>
                 <div className={cn("text-lg font-black", initialData ? "text-amber-700" : "text-green-700")}>{totalArea.toFixed(2)} ha</div>
              </div>
           </div>

           <div className="panel p-5 space-y-4">
              <label className="label">Warunki i Data</label>
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                className="input-field text-xl font-black p-3 border-2 border-green-500 shadow-sm text-slate-900 focus:ring-green-500 focus:border-green-600" 
              />
              <div className="grid grid-cols-2 gap-3">
                 <div>
                    <span className="text-xs text-gray-500 flex items-center gap-1"><Thermometer className="w-3 h-3"/> Temp (°C)</span>
                    <input type="number" value={temp} onChange={(e) => setTemp(Number(e.target.value))} className="input-field mt-1" />
                 </div>
                 <div>
                    <span className="text-xs text-gray-500 flex items-center gap-1"><Wind className="w-3 h-3"/> Wiatr (m/s)</span>
                    <input type="number" value={wind} onChange={(e) => setWind(Number(e.target.value))} className="input-field mt-1" />
                 </div>
              </div>
           </div>
        </div>

        {/* KOLUMNA 2: KALKULATOR - SZEROKOŚĆ 3/12 */}
        <div className="xl:col-span-3 space-y-6">
           <div className="panel p-5 space-y-6 h-full border-t-4 border-t-blue-500">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><Tractor className="w-5 h-5 text-blue-600"/> 2. Maszyna i Woda</h3>
              
              <div className="space-y-4">
                 <div>
                   <label className="label">Wybierz Opryskiwacz</label>
                   <select value={selectedMachineId} onChange={(e) => setSelectedMachineId(e.target.value)} className="input-field">
                      <option value="">-- Wybierz --</option>
                      {machines.map((m: Machine) => <option key={m.id} value={m.id}>{m.name} ({m.capacity} l)</option>)}
                   </select>
                 </div>
                 
                 <div>
                   <label className="label">Dawka Wody (l/ha)</label>
                   <input type="number" value={waterRate} onChange={(e) => setWaterRate(Number(e.target.value))} className="input-field font-bold text-blue-800" />
                 </div>
              </div>

              {/* WYNIKI KALKULATORA */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 space-y-3">
                 <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">Wyniki Obliczeń</div>
                 
                 <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-900">Obszar całkowity:</span>
                    <span className="font-bold text-slate-900">{totalArea.toFixed(2)} ha</span>
                 </div>
                 <div className="flex justify-between items-center pt-2 border-t border-blue-200">
                    <span className="text-sm text-blue-900">Potrzebna woda:</span>
                    <span className="font-black text-xl text-blue-700">{totalWater.toFixed(0)} l</span>
                 </div>
                 
                 {selectedMachine && (
                    <div className="mt-2 bg-white rounded p-2 text-center border border-blue-100 shadow-sm">
                       <span className="block text-xs text-gray-400 uppercase">Liczba zbiorników</span>
                       <span className="font-black text-2xl text-slate-800">{tanksNeeded}</span>
                       <span className="text-xs text-gray-500"> x {selectedMachine.capacity} l</span>
                    </div>
                 )}
              </div>
           </div>
        </div>

        {/* KOLUMNA 3: MIESZANINA - SZEROKOŚĆ 5/12 */}
        <div className="xl:col-span-5 space-y-6">
           <div className="panel p-0 h-full flex flex-col border-t-4 border-t-purple-500">
              <div className="p-5 border-b border-gray-200">
                 <h3 className="font-bold text-slate-800 flex items-center gap-2"><FlaskConical className="w-5 h-5 text-purple-600"/> 3. Skład Mieszaniny</h3>
                 <p className="text-xs text-gray-500 mt-1">Dodaj środki. System sprawdzi stan magazynowy.</p>
              </div>

              <div className="p-5 bg-slate-50 border-b border-gray-200 space-y-4">
                 <div>
                    <label className="label">Wybierz środek z Magazynu (Grupa Produktowa)</label>
                    <select value={addChemName} onChange={(e) => setAddChemName(e.target.value)} className="input-field">
                       <option value="">-- Wybierz składnik --</option>
                       {Object.entries(aggregatedWarehouse).map(([chemName, data]) => (
                          <option key={chemName} value={chemName}>
                             {chemName} (Łącznie: {data.total.toFixed(2)} {data.unit})
                          </option>
                       ))}
                    </select>
                    {selectedChemMeta && (
                       <div className="text-xs mt-2 bg-white p-2 border border-gray-200 rounded">
                          <div className="font-bold text-slate-800">Dostępne: {selectedChemStock.toFixed(2)} {selectedChemMeta.unit}</div>
                          <div className="text-slate-500">Zalecana dawka: {selectedChemMeta.recommendedDose} {selectedChemMeta.unit}/ha</div>
                          <div className="text-slate-500">Uprawy: {selectedChemMeta.crops}</div>
                       </div>
                    )}
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                    <div className="md:col-span-1">
                       <label className="label">Dawka</label>
                       <input 
                         type="number" 
                         step="0.01"
                         placeholder="0.00" 
                         value={addDose} 
                         onChange={(e) => setAddDose(e.target.value)} 
                         className="input-field font-bold"
                       />
                    </div>
                    <div className="md:col-span-2">
                       <label className="label">Cel zwalczania</label>
                       <input 
                         type="text" 
                         placeholder="np. Chwasty" 
                         value={addTarget} 
                         onChange={(e) => setAddTarget(e.target.value)} 
                         className="input-field"
                       />
                    </div>
                    <div className="md:col-span-1">
                       <button 
                          onClick={addMixItem}
                          disabled={!addChemName || !addDose || !addTarget || totalArea === 0}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                          DODAJ
                       </button>
                    </div>
                 </div>
                 {totalArea === 0 && <p className="text-xs text-red-500">Najpierw zaznacz pola w kolumnie 1!</p>}
              </div>

              <div className="flex-1 p-0 overflow-y-auto min-h-[200px]">
                 <table className="w-full text-left text-sm">
                    <thead className="bg-white text-gray-400 text-xs uppercase sticky top-0">
                       <tr>
                          <th className="p-3 border-b">Nazwa</th>
                          <th className="p-3 border-b">Dawka</th>
                          <th className="p-3 border-b">Cel</th>
                          <th className="p-3 border-b">Razem</th>
                          <th className="p-3 border-b w-10"></th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                       {mixItems.map((item, idx) => {
                          // Check against Aggregated Stock
                          const inStock = aggregatedWarehouse[item.chemName]?.total || 0;
                          const isShortage = !initialData && item.totalQuantity > inStock; 
                          const shortageAmount = (item.totalQuantity - inStock).toFixed(2);
                          
                          return (
                             <tr key={idx} className={cn("group", isShortage ? "bg-red-50" : "hover:bg-gray-50")}>
                                <td className="p-3 font-medium text-slate-800">{item.chemName}</td>
                                
                                {/* EDYCJA DAWKI IN-LINE */}
                                <td className="p-3">
                                   <div className="flex items-center gap-1">
                                      <input 
                                        type="number" 
                                        step="0.01"
                                        value={item.dose} 
                                        onChange={(e) => handleUpdateDose(idx, e.target.value)}
                                        className="w-20 p-1.5 bg-gray-50 border border-gray-300 rounded font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                      />
                                      <span className="text-xs text-gray-500">{item.unit}/ha</span>
                                   </div>
                                </td>

                                <td className="p-3 text-xs text-slate-500">{item.target}</td>
                                <td className="p-3 font-bold text-purple-700">
                                   {item.totalQuantity.toFixed(2)} {item.unit}
                                   {isShortage && (
                                     <div className="text-[10px] text-red-600 font-bold flex flex-col mt-1">
                                       <span className="flex items-center gap-1"><AlertCircle className="w-3 h-3"/> BRAK: {shortageAmount} {item.unit}</span>
                                       <span>(Stan: {inStock})</span>
                                     </div>
                                   )}
                                </td>
                                <td className="p-3 text-right">
                                   <button onClick={() => setMixItems(mixItems.filter((_, i) => i !== idx))} className="text-gray-300 hover:text-red-500"><X className="w-4 h-4"/></button>
                                </td>
                             </tr>
                          )
                       })}
                       {mixItems.length === 0 && (
                          <tr><td colSpan={5} className="p-8 text-center text-gray-400 italic">Lista pusta. Dodaj środki powyżej.</td></tr>
                       )}
                    </tbody>
                 </table>
              </div>

              <div className="p-5 border-t border-gray-200 bg-gray-50">
                 {hasGlobalShortage && !initialData && (
                   <div className="mb-4 bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded flex items-center gap-3">
                      <AlertTriangle className="w-6 h-6 shrink-0"/>
                      <div className="text-sm font-bold">
                        UWAGA: BRAK WYSTARCZAJĄCEJ ILOŚCI ŚRODKÓW!<br/>
                        <span className="font-normal">Zmniejsz dawkę lub dokup towar. Ryzyko mandatu PIORiN.</span>
                      </div>
                   </div>
                 )}
                 
                 {initialData ? (
                   <div className="flex gap-4">
                     <button 
                       onClick={onCancel}
                       className="flex-1 bg-white hover:bg-gray-100 text-gray-700 font-bold py-4 rounded-xl border border-gray-300 transition-all"
                     >
                       ANULUJ
                     </button>
                     <button 
                       onClick={handleFinalSave}
                       className="flex-[2] bg-amber-600 hover:bg-amber-700 text-white text-lg font-black py-4 rounded-xl shadow-lg shadow-amber-600/20 flex items-center justify-center gap-3 transition-transform active:scale-[0.99]"
                     >
                        <Save className="w-6 h-6"/> ZAPISZ ZMIANY
                     </button>
                   </div>
                 ) : (
                   <button 
                     onClick={handleFinalSave}
                     disabled={hasGlobalShortage}
                     className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-lg font-black py-4 rounded-xl shadow-lg shadow-green-600/20 flex items-center justify-center gap-3 transition-transform active:scale-[0.99]"
                   >
                      <CheckCircle2 className="w-6 h-6"/> {hasGlobalShortage ? "BLOKADA (BRAK TOWARU)" : "ZATWIERDŹ ZABIEG"}
                   </button>
                 )}
              </div>
           </div>
        </div>

     </div>
   )
};

// --- SUB-COMPONENTS UI ---

const TabButton = ({ active, onClick, icon: Icon, label, highlight }: any) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap text-sm font-bold select-none",
      active 
        ? (highlight ? "border-amber-500 text-amber-800 bg-amber-50" : "border-green-600 text-green-800 bg-green-50/50") 
        : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-white",
    )}
  >
    <Icon className={cn("w-4 h-4", active ? (highlight ? "text-amber-600" : "text-green-600") : "text-slate-400")} />
    {label}
  </button>
);

const SectionHeader = ({ title, desc }: any) => (
  <div>
    <h2 className="text-xl font-bold text-slate-900">{title}</h2>
    <p className="text-sm text-slate-500">{desc}</p>
  </div>
);

const FieldCard = ({ field, onEdit, onDelete }: any) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all group relative">
     <div className="flex justify-between items-start">
        <div>
           <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Działka {field.parcelNumber}</div>
           <h3 className="text-lg font-bold text-slate-900">{field.name}</h3>
        </div>
        <div className="text-right">
           <span className="block text-2xl font-black text-slate-800">{field.area}</span>
           <span className="text-xs text-slate-400 font-bold uppercase">ha</span>
        </div>
     </div>
     <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-green-100 text-green-800 border border-green-200">
           {field.crop}
        </span>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
           <button onClick={onEdit} className="icon-btn text-blue-600 bg-blue-50"><Pencil className="w-4 h-4"/></button>
           <button onClick={onDelete} className="icon-btn text-red-600 bg-red-50"><Trash2 className="w-4 h-4"/></button>
        </div>
     </div>
  </div>
);

const EmptyState = ({ msg }: { msg: string }) => (
  <div className="p-12 text-center border-t border-gray-100">
     <div className="inline-block p-4 bg-slate-50 rounded-full mb-3"><FileText className="w-8 h-8 text-slate-300"/></div>
     <p className="text-slate-500 font-medium">{msg}</p>
  </div>
);

// --- MODAL FORMS ---

const Modal = ({ title, children, onClose }: any) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:hidden">
     <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
     <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 p-6 animate-in zoom-in-95 slide-in-from-bottom-5 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
           <h3 className="text-xl font-bold text-slate-900">{title}</h3>
           <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full"><X className="w-6 h-6 text-slate-400"/></button>
        </div>
        {children}
     </div>
  </div>
);

const FieldForm = ({ initialData, onSubmit, onCancel }: any) => {
   const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      onSubmit({
         id: initialData?.id || Math.random().toString(),
         name: fd.get('name'),
         parcelNumber: fd.get('parcelNumber'),
         area: Number(fd.get('area')),
         crop: fd.get('crop')
      });
   };
   return (
      <form onSubmit={handleSubmit} className="space-y-4">
         <FormInput label="Nazwa Pola" name="name" defaultValue={initialData?.name} placeholder="np. Za Stodołą" required />
         <div className="grid grid-cols-2 gap-4">
            <FormInput label="Nr Działki" name="parcelNumber" defaultValue={initialData?.parcelNumber} placeholder="142/5" required />
            <FormInput label="Powierzchnia (ha)" name="area" type="number" step="0.01" defaultValue={initialData?.area} required />
         </div>
         <FormSelect label="Uprawa" name="crop" defaultValue={initialData?.crop} options={["Pszenica ozima", "Rzepak", "Kukurydza", "Burak", "Trawa", "Inne"]} />
         <FormActions onCancel={onCancel} />
      </form>
   )
};

// --- UPDATED CHEMICAL FORM (AUTOCOMPLETE + CONTROLLED INPUTS) ---
const ChemicalForm = ({ initialData, onSubmit, onCancel }: any) => {
   // State for controlled inputs to support auto-fill
   const [name, setName] = useState(initialData?.name || '');
   const [type, setType] = useState(initialData?.type || 'Fungicyd');
   const [activeSubstance, setActiveSubstance] = useState(initialData?.activeSubstance || '');
   const [crops, setCrops] = useState(initialData?.crops || '');
   const [quantity, setQuantity] = useState(initialData?.quantity || '');
   const [unit, setUnit] = useState(initialData?.unit || 'l');
   const [recommendedDose, setRecommendedDose] = useState(initialData?.recommendedDose || '');
   
   // BATCH SPECIFIC FIELDS
   const [batchNumber, setBatchNumber] = useState(initialData?.batchNumber || '');
   const [productionDate, setProductionDate] = useState(initialData?.productionDate || '');
   const [expiryDate, setExpiryDate] = useState(initialData?.expiryDate || '');
   const [authorizationDate, setAuthorizationDate] = useState(initialData?.authorizationDate || '');

   // Autocomplete state
   const [suggestions, setSuggestions] = useState<any[]>([]);
   const [showSuggestions, setShowSuggestions] = useState(false);
   const wrapperRef = useRef<HTMLDivElement>(null);

   const isGlobalVerified = GLOBAL_PESTICIDE_DB.some(db => db.name === name);

   // Filter suggestions on name change
   useEffect(() => {
      if (name.length > 1) {
         const matches = GLOBAL_PESTICIDE_DB.filter(db => 
            db.name.toLowerCase().includes(name.toLowerCase()) && db.name !== name
         );
         setSuggestions(matches);
         setShowSuggestions(matches.length > 0);
      } else {
         setShowSuggestions(false);
      }
   }, [name]);

   // Handle click outside to close suggestions
   useEffect(() => {
     function handleClickOutside(event: any) {
       if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
         setShowSuggestions(false);
       }
     }
     document.addEventListener("mousedown", handleClickOutside);
     return () => document.removeEventListener("mousedown", handleClickOutside);
   }, [wrapperRef]);

   const selectSuggestion = (item: any) => {
      setName(item.name);
      setType(item.type);
      setActiveSubstance(item.activeSubstance);
      setCrops(item.crops);
      setRecommendedDose(item.recommendedDose);
      setUnit(item.unit);
      setShowSuggestions(false);
   };

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit({
         id: initialData?.id || Math.random().toString(),
         name,
         type,
         activeSubstance,
         crops,
         quantity: Number(quantity),
         unit,
         recommendedDose,
         // BATCH DATA
         batchNumber,
         productionDate,
         expiryDate,
         authorizationDate
      });
   };

   return (
      <form onSubmit={handleSubmit} className="space-y-4" onClick={() => setShowSuggestions(false)}>
         <div className="grid grid-cols-2 gap-4">
            
            {/* NAME INPUT WITH AUTOCOMPLETE */}
            <div className="relative" ref={wrapperRef} onClick={(e) => e.stopPropagation()}>
               <label className="label flex justify-between">
                 Nazwa Handlowa
                 {isGlobalVerified && <span className="flex items-center gap-1 text-[10px] text-green-600 bg-green-50 px-1.5 rounded-full"><ShieldCheck className="w-3 h-3"/> Baza Globalna</span>}
               </label>
               <input 
                 className={cn("input-field", isGlobalVerified && "border-green-500 ring-1 ring-green-100")}
                 value={name} 
                 onChange={(e) => setName(e.target.value)} 
                 onFocus={() => name.length > 1 && setShowSuggestions(true)}
                 placeholder="np. Mospilan 20 SP" 
                 required 
                 autoComplete="off"
               />
               
               {/* SUGGESTIONS DROPDOWN */}
               {showSuggestions && (
                 <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-xl mt-1 max-h-48 overflow-y-auto animate-in slide-in-from-top-2">
                    {suggestions.map((item) => (
                      <div 
                        key={item.name} 
                        onClick={() => selectSuggestion(item)}
                        className="p-3 hover:bg-slate-50 cursor-pointer border-b border-gray-50 last:border-0"
                      >
                         <div className="font-bold text-sm text-slate-800 flex items-center gap-2">
                           {item.name} 
                           <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 rounded">{item.type}</span>
                         </div>
                         <div className="text-xs text-slate-500 mt-0.5 truncate">s.cz. {item.activeSubstance}</div>
                      </div>
                    ))}
                 </div>
               )}
            </div>

            <FormSelect 
               label="Typ Środka" 
               value={type} 
               onChange={(e: any) => setType(e.target.value)} 
               options={["Herbicyd", "Fungicyd", "Insektycyd", "Regulator", "Nawoz", "Adiuwant"]} 
            />
         </div>

         <FormInput 
            label="Substancja Czynna" 
            value={activeSubstance} 
            onChange={(e: any) => setActiveSubstance(e.target.value)}
            placeholder="np. Acetamipryd" 
            required 
         />
         
         {/* BATCH SECTION */}
         <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-4">
             <div className="grid grid-cols-2 gap-4">
               <FormInput 
                  label="Numer Partii" 
                  value={batchNumber} 
                  onChange={(e: any) => setBatchNumber(e.target.value)}
                  placeholder="np. BATCH-001" 
                  required 
               />
               <FormInput 
                  label="Data Przyjęcia" 
                  type="date" 
                  value={productionDate} 
                  onChange={(e: any) => setProductionDate(e.target.value)}
                  required 
               />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <FormInput 
                  label="Stan (Ilość)" 
                  type="number" 
                  step="0.01" 
                  value={quantity} 
                  onChange={(e: any) => setQuantity(e.target.value)}
                  required 
               />
               <FormSelect 
                  label="Jednostka" 
                  value={unit} 
                  onChange={(e: any) => setUnit(e.target.value)}
                  options={["l", "kg"]} 
               />
            </div>
         </div>

         <div className="grid grid-cols-2 gap-4">
            <FormInput 
               label="Data Ważności (Expiry)" 
               type="date" 
               value={expiryDate} 
               onChange={(e: any) => setExpiryDate(e.target.value)}
               required 
            />
            <FormInput 
               label="Data Dopuszczenia (Opc.)" 
               type="date" 
               value={authorizationDate} 
               onChange={(e: any) => setAuthorizationDate(e.target.value)}
            />
         </div>
         <FormActions onCancel={onCancel} />
      </form>
   )
};

const MachineForm = ({ initialData, onSubmit, onCancel }: any) => {
   const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      onSubmit({
         id: initialData?.id || Math.random().toString(),
         name: fd.get('name'),
         capacity: Number(fd.get('capacity')),
         inspectionDate: fd.get('inspectionDate')
      });
   };
   return (
      <form onSubmit={handleSubmit} className="space-y-4">
         <FormInput label="Nazwa Maszyny" name="name" defaultValue={initialData?.name} placeholder="np. Pilmet 2500" required />
         <div className="grid grid-cols-2 gap-4">
            <FormInput label="Pojemność (l)" name="capacity" type="number" defaultValue={initialData?.capacity} required />
            <FormInput label="Data Atestu" name="inspectionDate" type="date" defaultValue={initialData?.inspectionDate} required />
         </div>
         <FormActions onCancel={onCancel} />
      </form>
   )
};

// --- FORM HELPERS ---

const FormInput = ({ label, ...props }: any) => (
  <div>
     <label className="label">{label}</label>
     <input className="input-field" {...props} />
  </div>
);

const FormSelect = ({ label, options, ...props }: any) => (
  <div>
     <label className="label">{label}</label>
     <select className="input-field" {...props}>
        {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
     </select>
  </div>
);

const FormActions = ({ onCancel }: any) => (
  <div className="flex gap-3 pt-4 border-t border-gray-100 mt-2">
     <button type="button" onClick={onCancel} className="flex-1 py-3 text-slate-600 font-bold hover:bg-gray-100 rounded-lg transition-colors">Anuluj</button>
     <button type="submit" className="flex-1 bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-black transition-colors">Zapisz</button>
  </div>
);

// --- GLOBAL STYLES INJECTION ---
const STYLES = `
  .panel { background: white; border-radius: 0.75rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; }
  .input-field { width: 100%; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; background: #fff; color: #0f172a; font-weight: 500; outline: none; transition: all 0.2s; }
  .input-field:focus { border-color: #16a34a; box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1); }
  .label { display: block; font-size: 0.75rem; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 0.25rem; }
  .btn-primary { background: #16a34a; color: white; font-weight: 700; padding: 0.6rem 1.2rem; border-radius: 0.5rem; display: flex; align-items: center; gap: 0.5rem; transition: all 0.2s; }
  .btn-primary:hover { background: #15803d; transform: translateY(-1px); }
  .icon-btn { padding: 0.5rem; border-radius: 0.375rem; transition: all 0.2s; }
  .icon-btn:hover { filter: brightness(0.95); }
  .hide-scrollbar::-webkit-scrollbar { display: none; }
  .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  
  @media print {
    body { background: white !important; font-size: 12px; }
    .btn-primary, .icon-btn, button, nav { display: none !important; }
    .print\\:hidden { display: none !important; }
    .print\\:block { display: block !important; }
    .panel, .bg-white { box-shadow: none !important; border: none !important; }
    table { width: 100% !important; border-collapse: collapse !important; }
    th, td { border: 1px solid #ddd !important; padding: 4px !important; }
    thead { background: #eee !important; color: #000 !important; }
  }
`;

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = STYLES;
  document.head.appendChild(style);
}