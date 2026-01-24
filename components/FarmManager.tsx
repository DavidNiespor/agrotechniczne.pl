// @ts-nocheck
'use client';

import React, { useState, useMemo } from 'react';
import { signOut } from "next-auth/react";
import { 
  Sprout, Tractor, FlaskConical, FileText, Plus, Trash2, Pencil, X, 
  CheckCircle2, Droplets, Wind, Thermometer, LayoutGrid, ChevronRight, 
  LogOut, AlertTriangle, Package, History
} from 'lucide-react';
import { cn } from "@/lib/utils";

export const FarmManager = ({ session, initialFields = [], initialWarehouse = [] }) => {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState('fields');
  const [modalOpen, setModalOpen] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState([]);

  const [fields, setFields] = useState(initialFields.map(f => ({
    id: f.id, name: f.name, parcel: f.parcelNumber, area: f.area, crop: f.cropType
  })));

  const [warehouse, setWarehouse] = useState(initialWarehouse.map(w => ({
    id: w.id, name: w.name, quantity: w.quantity, unit: w.unit, batch: w.batchNumber || 'BRAK'
  })));

  // --- LOGIKA ZAPISU ---
  const handleSaveField = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get('name'),
      parcel: fd.get('parcel'),
      area: fd.get('area'),
      crop: fd.get('crop')
    };

    try {
      const res = await fetch('/api/fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok) {
        setFields(prev => [...prev, {
          id: result.id, name: result.name, parcel: result.parcelNumber, area: result.area, crop: result.cropType
        }]);
        setModalOpen(null);
      } else {
        alert("BŁĄD SERWERA: " + (result.error || "500"));
      }
    } catch (err) {
      alert("Błąd połączenia z API. Sprawdź konsolę.");
    }
  };

  return (
    <div className="bg-[#f1f5f9] min-h-screen pb-20 font-sans text-slate-900">
      
      {/* 1. TOP BAR */}
      <div className="bg-[#0f172a] text-white p-2 px-6 flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
        <div className="flex gap-6 items-center">
          <span className="text-slate-500 italic">agrotechniczne.pl</span>
          <span className="flex items-center gap-1"><Thermometer size={12} className="text-red-400"/> 18°C</span>
          <span className="flex items-center gap-1"><Wind size={12} className="text-blue-400"/> 2 m/s</span>
          <span className="flex items-center gap-1"><Droplets size={12} className="text-blue-300"/> 65%</span>
        </div>
        <button onClick={() => signOut({ callbackUrl: '/login' })} className="flex items-center gap-2 hover:text-red-400 transition-colors uppercase font-black">
          <LogOut size={12} /> WYLOGUJ
        </button>
      </div>

      {/* 2. HEADER & TABS */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2 uppercase italic">
            <Sprout size={32} className="text-green-600"/> agrotechniczne<span className="text-green-600">.pl</span>
          </h1>
          <div className="hidden md:flex gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <span>MAGAZYN: {warehouse.length}</span>
            <span>POLA: {fields.length}</span>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-4">
          <nav className="flex gap-1 overflow-x-auto hide-scrollbar">
            {[
              { id: 'treatment', label: '1. Nowy Zabieg', icon: Droplets },
              { id: 'fields', label: '2. Pola', icon: LayoutGrid },
              { id: 'warehouse', label: '3. Magazyn', icon: FlaskConical },
              { id: 'machines', label: '4. Maszyny', icon: Tractor },
              { id: 'reports', label: '5. Raporty', icon: FileText }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-3 px-8 py-5 text-[11px] font-black uppercase tracking-widest border-b-2 transition-all whitespace-nowrap",
                  activeTab === tab.id ? "border-green-600 text-green-700 bg-green-50/30" : "border-transparent text-slate-400"
                )}
              >
                <tab.icon size={14} /> {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* 3. CONTENT */}
      <main className="max-w-7xl mx-auto p-8 animate-in fade-in">
        
        {/* POLA */}
        {activeTab === 'fields' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-800">Twoje Pola</h2>
              <button onClick={() => setModalOpen('field')} className="bg-green-600 text-white font-black px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg uppercase text-xs tracking-widest">
                <Plus size={18} /> DODAJ POLE
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {fields.map(f => (
                <div key={f.id} className="bg-white rounded-[32px] border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
                   <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{f.parcel}</div>
                   <div className="text-3xl font-black text-slate-800">{f.area} ha</div>
                   <h3 className="font-bold text-lg text-slate-900 mt-1">{f.name}</h3>
                   <div className="mt-4 pt-4 border-t border-gray-100"><span className="px-3 py-1 rounded-full bg-green-100 text-green-800 font-black text-[10px] uppercase">{f.crop}</span></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MAGAZYN */}
        {activeTab === 'warehouse' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black uppercase tracking-tighter">Magazyn Środków</h2>
              <button className="bg-blue-600 text-white font-black px-6 py-3 rounded-xl uppercase text-xs tracking-widest shadow-lg">
                <Plus size={18} /> DODAJ PRODUKT
              </button>
            </div>
            <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
               <table className="w-full text-left font-bold text-sm">
                  <thead className="bg-slate-50 border-b text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    <tr><th className="p-4">Nazwa</th><th className="p-4">Ilość</th><th className="p-4">Partia</th><th className="p-4 text-right">Akcje</th></tr>
                  </thead>
                  <tbody>
                    {warehouse.map(w => (
                      <tr key={w.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="p-4">{w.name}</td>
                        <td className="p-4 text-blue-600">{w.quantity} {w.unit}</td>
                        <td className="p-4 text-slate-400 text-xs">{w.batch}</td>
                        <td className="p-4 text-right"><Trash2 size={16} className="text-slate-300 hover:text-red-500 inline cursor-pointer"/></td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}

        {/* INNE ZAKŁADKI (PLACEHOLDERY) */}
        {['treatment', 'machines', 'reports'].includes(activeTab) && (
          <div className="bg-white p-20 rounded-[40px] border-2 border-dashed border-slate-200 text-center">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                {activeTab === 'treatment' ? <Droplets size={40}/> : activeTab === 'machines' ? <Tractor size={40}/> : <FileText size={40}/>}
             </div>
             <h2 className="text-2xl font-black text-slate-800 uppercase mb-2">Sekcja w budowie</h2>
             <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Wykorzystaj Pola i Magazyn do testów zapisu.</p>
          </div>
        )}
      </main>

      {/* MODAL */}
      {modalOpen === 'field' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
           <div className="bg-white rounded-[40px] p-10 w-full max-w-md shadow-2xl relative animate-in zoom-in-95">
              <button onClick={() => setModalOpen(null)} className="absolute top-8 right-8 text-slate-400 p-1 hover:bg-slate-50 rounded-full"><X /></button>
              <h3 className="text-2xl font-black text-slate-800 uppercase mb-8 text-center tracking-tighter">Nowe Pole</h3>
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
    </div>
  );
};