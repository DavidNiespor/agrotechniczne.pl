// @ts-nocheck
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { signOut } from "next-auth/react";
import { 
  Sprout, Tractor, FlaskConical, FileText, Plus, Trash2, Pencil, Save, X, 
  CheckCircle2, Droplets, Wind, Thermometer, Calendar, LayoutGrid, Check, 
  AlertCircle, Printer, CloudSun, AlertTriangle, Search, Undo2, ShieldCheck, 
  ChevronDown, ChevronUp, ChevronRight, Hourglass, Clock, Package, Archive, 
  History, Recycle, Trash, Ban, Truck, LogOut
} from 'lucide-react';
import { cn } from "@/lib/utils";

// --- TYPY DANYCH (ZACHOWANE) ---
interface Field { id: string; name: string; parcelNumber: string; area: number; crop: string; }
type ChemType = 'Herbicyd' | 'Fungicyd' | 'Insektycyd' | 'Regulator' | 'Nawoz' | 'Adiuwant';
interface Chemical { 
  id: string; name: string; type: ChemType; activeSubstance: string; crops: string; 
  quantity: number; unit: string; recommendedDose: string; batchNumber: string; 
  productionDate: string; expiryDate: string; disposalDate?: string; isWastePending?: boolean;
}

export const FarmManager = ({ session, initialFields = [], initialWarehouse = [] }) => {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState('treatment');
  const [fields, setFields] = useState(initialFields.map(f => ({
    id: f.id, name: f.name, parcelNumber: f.parcelNumber || '', area: f.area, crop: f.cropType
  })));
  const [warehouse, setWarehouse] = useState(initialWarehouse.map(w => ({
    ...w,
    productionDate: w.productionDate ? new Date(w.productionDate).toISOString().split('T')[0] : '',
    expiryDate: w.expirationDate ? new Date(w.expirationDate).toISOString().split('T')[0] : ''
  })));
  const [modalOpen, setModalOpen] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState([]);

  // --- LOGIKA ZAPISU DO API ---
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
      body: JSON.stringify(data),
    });

    if (res.ok) {
      const saved = await res.json();
      setFields([...fields, { 
        id: saved.id, name: saved.name, area: saved.area, crop: saved.cropType, parcelNumber: saved.parcelNumber || data.parcel 
      }]);
      setModalOpen(null);
    }
  };

  const toggleGroup = (name) => setExpandedGroups(p => p.includes(name) ? p.filter(n => n !== name) : [...p, name]);

  const groupedActiveItems = useMemo(() => {
    const active = warehouse.filter(i => i.quantity > 0);
    const groups = {};
    active.forEach(item => {
      if (!groups[item.name]) groups[item.name] = { meta: item, batches: [], totalQty: 0 };
      groups[item.name].batches.push(item);
      groups[item.name].totalQty += item.quantity;
    });
    return Object.values(groups);
  }, [warehouse]);
  return (
    <div className="bg-slate-100 min-h-screen pb-20 font-sans text-slate-900">
      
      {/* 1. CZARNY PASEK POGODY */}
      <div className="bg-[#0f172a] text-white p-2 px-6 flex justify-between items-center text-[10px] font-bold tracking-widest uppercase">
        <div className="flex gap-6 items-center">
          <span className="text-slate-500 font-black italic tracking-tighter">agrotechniczne.pl</span>
          <span className="flex items-center gap-1"><Thermometer className="w-3 h-3 text-red-400"/> 18°C</span>
          <span className="flex items-center gap-1"><Wind className="w-3 h-3 text-blue-400"/> 2 m/s</span>
          <span className="flex items-center gap-1"><Droplets className="w-3 h-3 text-blue-300"/> 65%</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-green-600 px-3 py-1 rounded-full flex items-center gap-2 font-black">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE SYSTEM
          </div>
          <button onClick={() => signOut({ callbackUrl: '/login' })} className="hover:text-red-400 transition-colors flex items-center gap-1 border-l border-slate-700 pl-4 font-black">
            <LogOut className="w-3 h-3" /> WYLOGUJ
          </button>
        </div>
      </div>

      {/* 2. LOGO I STATYSTYKI */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2 uppercase italic">
            <Sprout className="w-8 h-8 text-green-600"/> agrotechniczne<span className="text-green-600">.pl</span>
          </h1>
          <div className="hidden md:flex items-center gap-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">
            <span className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 font-bold text-slate-900">
               MAGAZYN: {warehouse.length}
            </span>
            <span className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 font-bold text-slate-900">
               POLA: {fields.length}
            </span>
          </div>
        </div>
        
        {/* 3. NAWIGACJA ZAKŁADEK */}
        <div className="max-w-7xl mx-auto px-6 overflow-x-auto hide-scrollbar">
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
                    ? "border-green-600 text-green-700 bg-green-50/50" 
                    : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                )}
              >
                <item.icon className={cn("w-4 h-4", activeTab === item.id ? "text-green-600" : "text-slate-400")} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-8 animate-in fade-in duration-500">
        
        {/* ZAKŁADKA POLA */}
        {activeTab === 'fields' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Twoje Pola</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Ewidencja Gruntów Rolnych</p>
              </div>
              <button onClick={() => setModalOpen('field')} className="bg-green-600 hover:bg-green-700 text-white font-black px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-green-200 transition-all uppercase text-xs tracking-widest">
                <Plus className="w-5 h-5" /> DODAJ POLE
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {fields.map(field => (
                <div key={field.id} className="bg-white rounded-[24px] border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all group">
                   <div className="flex justify-between items-start">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{field.parcelNumber}</div>
                      <div className="text-right font-black text-2xl text-slate-800">{field.area} ha</div>
                   </div>
                   <h3 className="text-lg font-bold text-slate-900 mt-1">{field.name}</h3>
                   <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                      <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 font-black text-[10px] uppercase tracking-widest">{field.crop}</span>
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Pencil className="w-4 h-4"/></button>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ZAKŁADKA MAGAZYN */}
        {activeTab === 'warehouse' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Magazyn Środków</h2>
              <button onClick={() => setModalOpen('chemical')} className="bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-3 rounded-xl flex items-center gap-2 uppercase text-xs tracking-widest transition-all">
                <Plus className="w-5 h-5" /> DODAJ ŚRODEK
              </button>
            </div>
            <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
               <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    <tr><th className="p-4 w-12"></th><th className="p-4">Środek</th><th className="p-4">Ilość</th><th className="p-4 text-right">Akcje</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-bold text-sm">
                    {groupedActiveItems.map(group => (
                      <React.Fragment key={group.meta.name}>
                        <tr onClick={() => toggleGroup(group.meta.name)} className="hover:bg-slate-50 cursor-pointer">
                          <td className="p-4"><ChevronRight className={cn("w-5 h-5 text-slate-400 transition-transform", expandedGroups.includes(group.meta.name) && "rotate-90")}/></td>
                          <td className="p-4">{group.meta.name}</td>
                          <td className="p-4 text-blue-600 font-black text-lg">{group.totalQty} {group.meta.unit}</td>
                          <td className="p-4 text-right"><Trash2 className="w-4 h-4 text-slate-300 hover:text-red-500 inline cursor-pointer transition-colors"/></td>
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}
      </main>

      {/* MODALE */}
      {modalOpen === 'field' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
           <div className="bg-white rounded-[40px] p-10 w-full max-w-md shadow-2xl relative animate-in zoom-in-95">
              <button onClick={() => setModalOpen(null)} className="absolute top-8 right-8 p-1 hover:bg-gray-100 rounded-full text-slate-400"><X className="w-6 h-6"/></button>
              <h3 className="text-2xl font-black text-slate-800 uppercase mb-8 tracking-tighter text-center">Dodaj Nowe Pole</h3>
              <form onSubmit={handleSaveField} className="space-y-4">
                 <input name="name" placeholder="Nazwa Pola" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:bg-white focus:border-green-500 transition-all" required />
                 <div className="grid grid-cols-2 gap-4">
                    <input name="parcel" placeholder="Nr Działki" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:bg-white focus:border-green-500 transition-all" required />
                    <input name="area" type="number" step="0.01" placeholder="Obszar ha" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:bg-white focus:border-green-500 transition-all" required />
                 </div>
                 <input name="crop" placeholder="Uprawa" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:bg-white focus:border-green-500 transition-all" required />
                 <button type="submit" className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl mt-6 uppercase text-xs tracking-widest hover:bg-black transition-all shadow-xl">ZAPISZ POLE W BAZIE</button>
              </form>
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