// @ts-nocheck
'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { signOut } from "next-auth/react";
import { 
  Sprout, Tractor, FlaskConical, FileText, Plus, Trash2, Pencil, Save, X, 
  CheckCircle2, Droplets, Wind, Thermometer, Calendar, LayoutGrid, Check, 
  AlertCircle, Printer, CloudSun, AlertTriangle, Search, Undo2, ShieldCheck, 
  ChevronDown, ChevronUp, ChevronRight, Hourglass, Clock, Package, Archive, 
  History, Recycle, Trash, Ban, Truck, LogOut
} from 'lucide-react';
import { cn } from "@/lib/utils"

// --- PROPSY ---
interface FarmManagerProps {
  session: any;
  initialFields: any[];
  initialWarehouse: any[];
}

export const FarmManager: React.FC<FarmManagerProps> = ({ session, initialFields = [], initialWarehouse = [] }) => {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<'treatment' | 'fields' | 'warehouse' | 'machines' | 'reports'>('treatment');
  
  // MAPOWANIE DANYCH Z PRISMA NA TWOJE TYPY FRONTENDOWE
  const [fields, setFields] = useState(initialFields.map(f => ({
    id: f.id,
    name: f.name,
    parcelNumber: f.parcelNumber || '',
    area: f.area,
    crop: f.cropType // Prisma: cropType -> Frontend: crop
  })));

  const [warehouse, setWarehouse] = useState(initialWarehouse.map(w => ({
    id: w.id,
    name: w.name,
    quantity: w.quantity,
    unit: w.unit,
    batchNumber: w.batchNumber || '',
    expiryDate: w.expirationDate ? new Date(w.expirationDate).toISOString().split('T')[0] : '',
    productionDate: w.productionDate ? new Date(w.productionDate).toISOString().split('T')[0] : '',
    type: 'Środek', // Domyślny typ dla bazy
    activeSubstance: '',
    crops: ''
  })));

  const [machines, setMachines] = useState([
    { id: '1', name: 'Pilmet 2500', capacity: 2500, inspectionDate: '2024-05-20' }
  ]);
  const [treatments, setTreatments] = useState([]);

  // MODALS STATE
  const [modalOpen, setModalOpen] = useState<'field' | 'chemical' | 'machine' | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);

  // --- CRUD HANDLERS (ZACHOWANE Z TWOJEGO KODU) ---
  const handleSaveField = (item: any) => {
    if (editingItem) setFields(fields.map(i => i.id === item.id ? item : i));
    else setFields([...fields, item]);
    setModalOpen(null);
  };

  const handleSaveChemical = (item: any) => {
    if (editingItem) setWarehouse(warehouse.map(i => i.id === item.id ? item : i));
    else setWarehouse([...warehouse, item]);
    setModalOpen(null);
  };

  const handleSaveMachine = (item: any) => {
    if (editingItem) setMachines(machines.map(i => i.id === item.id ? item : i));
    else setMachines([...machines, item]);
    setModalOpen(null);
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-900">
      
      {/* 1. CZARNY PASEK GÓRNY (POGODA) */}
      <div className="bg-slate-900 text-white p-2 px-6 flex justify-between items-center text-[10px] font-bold tracking-widest uppercase">
        <div className="flex gap-6 items-center">
          <span className="text-slate-500 font-black">PARAMETRY POGODOWE:</span>
          <span className="flex items-center gap-1"><Thermometer className="w-3 h-3 text-red-400"/> 18°C</span>
          <span className="flex items-center gap-1"><Wind className="w-3 h-3 text-blue-400"/> 2 m/s</span>
          <span className="flex items-center gap-1"><Droplets className="w-3 h-3 text-blue-300"/> 65%</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-green-600 px-3 py-1 rounded-full flex items-center gap-2 font-black">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            LIVE SYSTEM
          </div>
          <button onClick={() => signOut({ callbackUrl: '/login' })} className="hover:text-red-400 transition-colors flex items-center gap-1 border-l border-slate-700 pl-4 font-black text-[10px]">
            <LogOut className="w-3 h-3" /> WYLOGUJ
          </button>
        </div>
      </div>

      {/* 2. LOGO I STATYSTYKI */}
      <div className="bg-white border-b border-slate-200 px-6 py-5 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
            <Sprout className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-black text-slate-800 tracking-tighter uppercase">
            agrotechniczne<span className="text-green-600">.pl</span>
          </span>
        </div>
        <div className="flex items-center gap-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">
            <span className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
              Gospodarstwo: <span className="text-slate-900">{session?.user?.farmName || "Brak nazwy"}</span>
            </span>
            <span className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
              Pola: <span className="text-slate-900">{fields.length}</span>
            </span>
        </div>
      </div>

      {/* 3. NAWIGACJA ZAKŁADEK (POZIOMA) */}
      <div className="bg-white border-b border-slate-200 px-6 overflow-x-auto hide-scrollbar">
        <nav className="flex gap-1 min-w-max">
          {[
            { id: 'treatment', label: '1. Nowy Zabieg', icon: Droplets },
            { id: 'fields', label: '2. Pola', icon: LayoutGrid },
            { id: 'warehouse', label: '3. Magazyn', icon: FlaskConical },
            { id: 'machines', label: '4. Maszyny', icon: Tractor },
            { id: 'reports', label: '5. Raporty', icon: FileText }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex items-center gap-3 px-8 py-5 text-[11px] font-black uppercase tracking-[0.2em] border-b-2 transition-all",
                activeTab === item.id 
                  ? "border-green-600 text-green-700 bg-green-50/30" 
                  : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50/50"
              )}
            >
              <item.icon className={cn("w-4 h-4", activeTab === item.id ? "text-green-600" : "text-slate-400")} />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* 4. TREŚĆ GŁÓWNA */}
      <main className="max-w-7xl mx-auto p-8 animate-in fade-in duration-500">
        
        {/* ZAKŁADKA POLA */}
        {activeTab === 'fields' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Twoje Pola</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Ewidencja Gruntów Rolnych</p>
              </div>
              <button onClick={() => { setEditingItem(null); setModalOpen('field'); }} className="bg-green-600 hover:bg-green-700 text-white font-black px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-green-200 transition-all uppercase text-xs tracking-widest">
                <Plus className="w-5 h-5" /> Dodaj Pole
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {fields.map(field => (
                <div key={field.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-green-500 transition-all group">
                   <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center group-hover:bg-green-50"><Sprout className="w-5 h-5 text-slate-400 group-hover:text-green-600"/></div>
                      <span className="bg-slate-100 text-slate-600 font-black text-[10px] px-2 py-1 rounded uppercase tracking-widest">{field.area} ha</span>
                   </div>
                   <h3 className="font-black text-slate-800 text-lg tracking-tight mb-1">{field.name}</h3>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{field.crop}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ZAKŁADKA MAGAZYN */}
        {activeTab === 'warehouse' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Magazyn Środków</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Zarządzanie partiami i utylizacja</p>
              </div>
              <button onClick={() => { setEditingItem(null); setModalOpen('chemical'); }} className="bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-200 transition-all uppercase text-xs tracking-widest">
                <Plus className="w-5 h-5" /> Dodaj Środek
              </button>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  <tr>
                    <th className="p-4">Środek</th>
                    <th className="p-4">Ilość</th>
                    <th className="p-4">Partia</th>
                    <th className="p-4 text-right">Akcje</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-bold text-sm">
                  {warehouse.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 text-slate-800">{item.name}</td>
                      <td className="p-4 text-blue-600">{item.quantity} {item.unit}</td>
                      <td className="p-4 text-slate-500 font-mono">{item.batchNumber}</td>
                      <td className="p-4 text-right">
                        <button className="text-slate-400 hover:text-blue-600 mr-3"><Pencil className="w-4 h-4"/></button>
                        <button className="text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4"/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ZAKŁADKA MASZYNY */}
        {activeTab === 'machines' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Park Maszynowy</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Ewidencja atestów opryskiwaczy</p>
              </div>
              <button onClick={() => { setEditingItem(null); setModalOpen('machine'); }} className="bg-slate-800 hover:bg-slate-900 text-white font-black px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg transition-all uppercase text-xs tracking-widest">
                <Plus className="w-5 h-5" /> Dodaj Maszynę
              </button>
            </div>
          </div>
        )}

        {/* ZAKŁADKA NOWY ZABIEG (DOMYŚLNA) */}
        {activeTab === 'treatment' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
             <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h2 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-tighter text-center">Rejestracja Nowego Zabiegu</h2>
                <p className="text-center text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-8">Krok 1: Wybierz pola do oprysku</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {fields.map(f => (
                    <div key={f.id} className="p-6 bg-slate-50 rounded-2xl border-2 border-slate-100 hover:border-green-500 cursor-pointer transition-all group">
                       <h3 className="font-black text-slate-800 group-hover:text-green-700">{f.name}</h3>
                       <p className="text-[10px] text-slate-400 font-black uppercase mt-1">{f.area} ha • {f.crop}</p>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        )}
      </main>

      {/* MODALE (ZACHOWANE Z TWOJEGO KODU) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
           <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Dodaj Nowy Element</h3>
                <button onClick={() => setModalOpen(null)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-6 h-6 text-slate-400"/></button>
              </div>
              {/* Formularze tutaj... */}
              <p className="text-slate-400 text-sm italic">Otwarto formularz dla sekcji: {modalOpen}</p>
              <button onClick={() => setModalOpen(null)} className="w-full mt-6 bg-slate-900 text-white font-black py-4 rounded-xl">ZAMKNIJ I WRÓĆ</button>
           </div>
        </div>
      )}

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};