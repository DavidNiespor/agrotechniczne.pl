// @ts-nocheck
'use client';

import React, { useState, useMemo } from 'react';
import { signOut } from "next-auth/react";
import { 
  Sprout, Tractor, FlaskConical, FileText, Plus, Trash2, Pencil, X, 
  Droplets, Wind, Thermometer, LayoutGrid, ChevronRight, LogOut,
  CheckCircle2, AlertTriangle, Hourglass
} from 'lucide-react';
import { cn } from "@/lib/utils";

export const FarmManager = ({ session, initialFields = [], initialWarehouse = [] }) => {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState('fields');
  const [modalOpen, setModalOpen] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState([]);

  // Dane zainicjowane z Twojego page.tsx
  const [fields, setFields] = useState(initialFields.map(f => ({
    id: f.id, 
    name: f.name, 
    parcel: f.parcelNumber, 
    area: f.area, 
    crop: f.cropType 
  })));

  const [warehouse, setWarehouse] = useState(initialWarehouse.map(w => ({
    id: w.id, 
    name: w.name, 
    quantity: w.quantity, 
    unit: w.unit, 
    batch: w.batchNumber,
    expiry: w.expirationDate
  })));

  // --- FUNKCJA ZAPISU DO BAZY (NAPRAWIONA) ---
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

      if (res.ok) {
        const saved = await res.json();
        // Dodajemy do stanu, żeby od razu wskoczyło na layout
        setFields(prev => [...prev, {
          id: saved.id,
          name: saved.name,
          parcel: saved.parcelNumber,
          area: saved.area,
          crop: saved.cropType
        }]);
        setModalOpen(null);
      } else {
        alert("Serwer nie zapisał danych. Sprawdź terminal.");
      }
    } catch (err) {
      alert("Błąd połączenia z API.");
    }
  };

  const toggleGroup = (name) => setExpandedGroups(p => p.includes(name) ? p.filter(n => n !== name) : [...p, name]);

  return (
    <div className="bg-[#f1f5f9] min-h-screen pb-20 font-sans text-slate-900">
      
      {/* 1. CZARNY PASEK POGODY */}
      <div className="bg-[#0f172a] text-white p-2 px-6 flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
        <div className="flex gap-6 items-center">
          <span className="text-slate-500 italic">agrotechniczne.pl</span>
          <span className="flex items-center gap-1"><Thermometer className="w-3 h-3 text-red-400"/> 18°C</span>
          <span className="flex items-center gap-1"><Wind className="w-3 h-3 text-blue-400"/> 2 m/s</span>
          <span className="flex items-center gap-1"><Droplets className="w-3 h-3 text-blue-300"/> 65%</span>
        </div>
        <button onClick={() => signOut({ callbackUrl: '/login' })} className="flex items-center gap-2 hover:text-red-400 transition-colors uppercase">
          <LogOut className="w-3 h-3" /> WYLOGUJ
        </button>
      </div>

      {/* 2. LOGO I MENU */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2 uppercase italic">
            <Sprout className="w-8 h-8 text-green-600"/> agrotechniczne<span className="text-green-600">.pl</span>
          </h1>
          <div className="hidden md:flex gap-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">
            <span>MAGAZYN: {warehouse.length}</span>
            <span>POLA: {fields.length}</span>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-4"><nav className="flex gap-1 overflow-x-auto hide-scrollbar">
          {['treatment', 'fields', 'warehouse', 'machines', 'reports'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={cn(
              "px-8 py-5 text-[11px] font-black uppercase tracking-widest border-b-2 transition-all",
              activeTab === tab ? "border-green-600 text-green-700 bg-green-50/30" : "border-transparent text-slate-400"
            )}>
              {tab === 'fields' ? '2. Pola' : tab === 'warehouse' ? '3. Magazyn' : tab === 'treatment' ? '1. Nowy Zabieg' : tab}
            </button>
          ))}</nav></div>
      </div>

      {/* 3. TREŚĆ GŁÓWNA */}
      <main className="max-w-7xl mx-auto p-8 animate-in fade-in">
        {activeTab === 'fields' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black uppercase tracking-tighter">Twoje Pola</h2>
              <button onClick={() => setModalOpen('field')} className="bg-green-600 hover:bg-green-700 text-white font-black px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-green-200 uppercase text-xs tracking-widest">
                <Plus className="w-5 h-5" /> DODAJ POLE
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {fields.map(f => (
                <div key={f.id} className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
                   <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{f.parcel}</div>
                   <div className="text-3xl font-black text-slate-800">{f.area} ha</div>
                   <h3 className="font-bold text-lg text-slate-900 mt-1">{f.name}</h3>
                   <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                      <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 font-black text-[10px] uppercase">{f.crop}</span>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'warehouse' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black uppercase tracking-tighter">Magazyn</h2>
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
               <table className="w-full text-left font-bold text-sm">
                  <thead className="bg-slate-50 border-b text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    <tr><th className="p-4">Środek</th><th className="p-4">Ilość</th><th className="p-4">Status</th></tr>
                  </thead>
                  <tbody>
                    {warehouse.map(w => (
                      <tr key={w.id} className="border-b border-slate-100">
                        <td className="p-4">{w.name}</td>
                        <td className="p-4 text-blue-600">{w.quantity} {w.unit}</td>
                        <td className="p-4"><CheckCircle2 className="w-4 h-4 text-green-500" /></td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}
      </main>

      {/* 4. MODAL (PEŁNY DESIGN) */}
      {modalOpen === 'field' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
           <div className="bg-white rounded-[40px] p-10 w-full max-w-md shadow-2xl relative animate-in zoom-in-95">
              <button onClick={() => setModalOpen(null)} className="absolute top-8 right-8 text-slate-400"><X /></button>
              <h3 className="text-2xl font-black uppercase mb-8 text-center tracking-tighter">Nowe Pole</h3>
              <form onSubmit={handleSaveField} className="space-y-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Nazwa Pola</label>
                    <input name="name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:bg-white focus:border-green-500" placeholder="np. Za Stodołą" required />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black uppercase text-slate-400">Nr Działki</label>
                       <input name="parcel" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:bg-white focus:border-green-500" placeholder="142/5" required />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black uppercase text-slate-400">Obszar (ha)</label>
                       <input name="area" type="number" step="0.01" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:bg-white focus:border-green-500" placeholder="0.00" required />
                    </div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Uprawa</label>
                    <input name="crop" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:bg-white focus:border-green-500" placeholder="np. Pszenica" required />
                 </div>
                 <button type="submit" className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl mt-4 uppercase text-xs tracking-widest hover:bg-black transition-all">ZAPISZ POLE W BAZIE</button>
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