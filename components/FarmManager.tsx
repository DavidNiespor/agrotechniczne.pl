// @ts-nocheck
'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { signOut } from "next-auth/react";
import { 
  Sprout, Tractor, FlaskConical, FileText, Plus, Trash2, Pencil, Save, X, CheckCircle2, 
  Droplets, Wind, Thermometer, Calendar, LayoutGrid, Check, AlertCircle, Printer, 
  CloudSun, AlertTriangle, Search, Undo2, ShieldCheck, ChevronDown, ChevronUp, 
  ChevronRight, Hourglass, Clock, Package, Archive, History, Recycle, Trash, Ban, Truck, LogOut
} from 'lucide-react';
import { cn } from "@/lib/utils"

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
  batchNumber: string;
  productionDate: string;
  expiryDate: string;
  disposalDate?: string;
  isWastePending?: boolean;
}

interface Machine {
  id: string;
  name: string;
  capacity: number;
  inspectionDate: string;
}

// --- KOMPONENT GŁÓWNY ---

export const FarmManager = ({ session, initialFields = [], initialWarehouse = [] }) => {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState('treatment');
  
  // Inicjalizacja danymi z bazy (Initial props od page.tsx)
  const [fields, setFields] = useState(initialFields.map(f => ({
    id: f.id,
    name: f.name,
    parcelNumber: f.parcelNumber || 'N/A',
    area: f.area,
    crop: f.cropType // Prisma cropType -> Frontend crop
  })));

  const [warehouse, setWarehouse] = useState(initialWarehouse.map(w => ({
    id: w.id,
    name: w.name,
    type: 'Środek',
    activeSubstance: '',
    crops: '',
    quantity: w.quantity,
    unit: w.unit,
    batchNumber: w.batchNumber || '',
    productionDate: w.productionDate ? new Date(w.productionDate).toISOString().split('T')[0] : '',
    expiryDate: w.expirationDate ? new Date(w.expirationDate).toISOString().split('T')[0] : '',
    recommendedDose: ''
  })));

  const [machines, setMachines] = useState([
    { id: '1', name: 'Pilmet 2500', capacity: 2500, inspectionDate: '2026-05-20' },
    { id: '2', name: 'Biardzki 600', capacity: 600, inspectionDate: '2024-11-10' },
  ]);

  const [treatments, setTreatments] = useState([]);
  const [modalOpen, setModalOpen] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState([]);

  // --- HANDLERY (LOGIKA ZAPISU DO API) ---

  const handleSaveField = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get('name'),
      parcel: fd.get('parcel'),
      area: fd.get('area'),
      crop: fd.get('crop')
    };

    const res = await fetch('/api/fields', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (res.ok) {
      const saved = await res.json();
      setFields([...fields, { 
        id: saved.id, 
        name: saved.name, 
        area: saved.area, 
        crop: saved.cropType, 
        parcelNumber: saved.parcelNumber || data.parcel 
      }]);
      setModalOpen(null);
    }
  };

  const toggleGroup = (name) => {
    setExpandedGroups(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  };

  return (
    <div className="bg-slate-100 min-h-screen pb-20 font-sans text-slate-900 print:bg-white print:pb-0">
      
      {/* 1. CZARNY PASEK POGODY */}
      <div className="bg-slate-900 text-white p-2 px-6 flex justify-between items-center text-[10px] font-bold tracking-widest uppercase print:hidden">
        <div className="flex gap-6 items-center">
          <span className="text-slate-500 font-black italic">PARAMETRY POGODOWE:</span>
          <span className="flex items-center gap-1"><Thermometer className="w-3 h-3 text-red-400"/> 18°C</span>
          <span className="flex items-center gap-1"><Wind className="w-3 h-3 text-blue-400"/> 2 m/s</span>
          <span className="flex items-center gap-1"><Droplets className="w-3 h-3 text-blue-300"/> 65%</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-green-600 px-3 py-1 rounded-full flex items-center gap-2 font-black">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            LIVE SYSTEM
          </div>
          <button onClick={() => signOut({ callbackUrl: '/login' })} className="hover:text-red-400 transition-colors flex items-center gap-1 border-l border-slate-700 pl-4 font-black">
            <LogOut className="w-3 h-3" /> WYLOGUJ
          </button>
        </div>
      </div>

      {/* 2. LOGO I STATYSTYKI */}
      <div className="bg-white border-b border-gray-300 sticky top-0 z-20 shadow-md print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 uppercase">
            <Sprout className="w-8 h-8 text-green-600"/> 
            <span>agrotechniczne<span className="text-green-600">.pl</span></span>
          </h1>
          <div className="hidden md:flex items-center gap-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">
            <span className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
               Magazyn: <span className="text-slate-900">{warehouse.length}</span>
            </span>
            <span className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
               Pola: <span className="text-slate-900">{fields.length}</span>
            </span>
          </div>
        </div>
        
        {/* 3. NAWIGACJA ZAKŁADEK */}
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto hide-scrollbar">
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
                  "flex items-center gap-3 px-8 py-5 text-[11px] font-black uppercase tracking-[0.2em] border-b-2 transition-all whitespace-nowrap",
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
      </div>

      {/* 4. TREŚĆ GŁÓWNA */}
      <main className="max-w-7xl mx-auto p-8 animate-in fade-in duration-500">
        
        {/* WIDOK POLA */}
        {activeTab === 'fields' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Twoje Pola</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Ewidencja Gruntów Rolnych</p>
              </div>
              <button onClick={() => { setEditingItem(null); setModalOpen('field'); }} className="btn-primary">
                <Plus className="w-5 h-5" /> DODAJ POLE
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {fields.map(field => (
                <div key={field.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all group relative">
                   <div className="flex justify-between items-start">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Działka {field.parcelNumber}</div>
                      <div className="text-right">
                         <span className="block text-2xl font-black text-slate-800">{field.area}</span>
                         <span className="text-[10px] text-slate-400 font-bold uppercase">ha</span>
                      </div>
                   </div>
                   <h3 className="text-lg font-bold text-slate-900 mt-1">{field.name}</h3>
                   <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800 border border-green-200 uppercase">
                        {field.crop}
                      </span>
                      <div className="flex gap-2">
                         <button className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Pencil className="w-4 h-4"/></button>
                         <button className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4"/></button>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WIDOK MAGAZYN */}
        {activeTab === 'warehouse' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Magazyn Środków</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Stany magazynowe i utylizacja</p>
              </div>
              <button onClick={() => setModalOpen('chemical')} className="btn-primary bg-blue-600">
                <Plus className="w-5 h-5" /> DODAJ ŚRODEK
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
                        <td className="p-4 text-slate-400 font-mono">{item.batchNumber}</td>
                        <td className="p-4 text-right flex justify-end gap-2">
                           <button className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Pencil className="w-4 h-4"/></button>
                           <button className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4"/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}

        {/* DOMYŚLNY WIDOK ZABIEGU */}
        {activeTab === 'treatment' && (
          <div className="space-y-8">
             <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm text-center">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Droplets className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-tighter">Rejestracja Nowego Zabiegu</h2>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-8">Krok 1: Wybierz pola do oprysku</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {fields.map(f => (
                    <div key={f.id} className="p-6 bg-slate-50 rounded-2xl border-2 border-slate-100 hover:border-green-500 cursor-pointer transition-all group">
                       <h3 className="font-black text-slate-800 group-hover:text-green-700">{f.name}</h3>
                       <p className="text-[10px] text-slate-400 font-black uppercase mt-1">{f.area} ha • {f.crop}</p>
                    </div>
                  ))}
                </div>
                <button className="mt-8 bg-slate-900 text-white font-black px-10 py-4 rounded-2xl uppercase text-xs tracking-widest hover:bg-black transition-all">Przejdź do wyboru środków</button>
             </div>
          </div>
        )}

      </main>

      {/* --- MODAL POLA --- */}
      {modalOpen === 'field' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
           <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative animate-in zoom-in-95">
              <button onClick={() => setModalOpen(null)} className="absolute top-6 right-6 p-1 hover:bg-gray-100 rounded-full text-slate-400"><X className="w-6 h-6"/></button>
              <h3 className="text-xl font-black text-slate-800 uppercase mb-6 tracking-tighter">Dodaj Nowe Pole</h3>
              <form onSubmit={handleSaveField} className="space-y-4">
                 <div>
                   <label className="label">Nazwa Pola</label>
                   <input name="name" className="input-field" placeholder="np. Za Stodołą" required />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="label">Nr Działki</label>
                     <input name="parcel" className="input-field" placeholder="142/5" required />
                   </div>
                   <div>
                     <label className="label">Obszar (ha)</label>
                     <input name="area" type="number" step="0.01" className="input-field" placeholder="0.00" required />
                   </div>
                 </div>
                 <div>
                   <label className="label">Uprawa</label>
                   <input name="crop" className="input-field" placeholder="np. Pszenica ozima" required />
                 </div>
                 <button type="submit" className="w-full bg-slate-900 text-white font-black py-4 rounded-xl mt-4 uppercase text-xs tracking-widest hover:bg-black transition-all">ZAPISZ W BAZIE DANYCH</button>
              </form>
           </div>
        </div>
      )}

      {/* --- MODAL ŚRODKA --- */}
      {modalOpen === 'chemical' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
           <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative animate-in zoom-in-95">
              <button onClick={() => setModalOpen(null)} className="absolute top-6 right-6 p-1 hover:bg-gray-100 rounded-full text-slate-400"><X className="w-6 h-6"/></button>
              <h3 className="text-xl font-black text-slate-800 uppercase mb-6 tracking-tighter">Dodaj Środek</h3>
              <form className="space-y-4">
                 <div><label className="label">Nazwa</label><input className="input-field" required /></div>
                 <div className="grid grid-cols-2 gap-4">
                    <div><label className="label">Ilość</label><input type="number" className="input-field" required /></div>
                    <div><label className="label">Jednostka</label><select className="input-field"><option>l</option><option>kg</option></select></div>
                 </div>
                 <button type="submit" className="w-full bg-blue-600 text-white font-black py-4 rounded-xl mt-4 uppercase text-xs tracking-widest">DODAJ PARTIĘ</button>
              </form>
           </div>
        </div>
      )}

      {/* --- TWOJE STYLE CSS (100% ORYGINAŁ) --- */}
      <style jsx global>{`
        .input-field { width: 100%; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 0.75rem; background: #f8fafc; font-weight: 700; outline: none; transition: all 0.2s; }
        .input-field:focus { border-color: #16a34a; background: #fff; box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1); }
        .label { display: block; font-size: 0.65rem; font-weight: 900; color: #64748b; text-transform: uppercase; margin-bottom: 0.35rem; tracking: 0.1em; }
        .btn-primary { background: #16a34a; color: white; font-weight: 900; padding: 0.75rem 1.5rem; border-radius: 0.75rem; display: flex; align-items: center; gap: 0.5rem; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.05em; transition: all 0.2s; }
        .btn-primary:hover { background: #15803d; transform: translateY(-1px); }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @media print {
          body { background: white !important; font-size: 12px; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
};