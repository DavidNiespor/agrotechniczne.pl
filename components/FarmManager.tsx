// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { signOut } from "next-auth/react";
import { Sprout, Plus, X, Droplets, Wind, Thermometer, LayoutGrid, LogOut, Pencil, Trash2 } from 'lucide-react';
import { cn } from "@/lib/utils";

export const FarmManager = ({ initialFields = [], initialWarehouse = [] }) => {
  const [activeTab, setActiveTab] = useState('fields');
  const [fields, setFields] = useState(initialFields.map(f => ({
    id: f.id, name: f.name, parcel: f.parcelNumber, area: f.area, crop: f.cropType
  })));
  const [modalOpen, setModalOpen] = useState(false);

  const handleSaveField = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = { name: fd.get('name'), parcel: fd.get('parcel'), area: fd.get('area'), crop: fd.get('crop') };
    
    const res = await fetch('/api/fields', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      const saved = await res.json();
      setFields([...fields, { id: saved.id, name: saved.name, area: saved.area, crop: saved.cropType, parcel: saved.parcelNumber }]);
      setModalOpen(false);
    }
  };

  return (
    <div className="bg-[#f1f5f9] min-h-screen pb-20 font-sans text-slate-900">
      {/* BLACK WEATHER BAR */}
      <div className="bg-[#0f172a] text-white p-2 px-6 flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
        <div className="flex gap-6 items-center">
          <span className="text-slate-500 italic">agrotechniczne.pl</span>
          <span className="flex items-center gap-1"><Thermometer className="w-3 h-3 text-red-400"/> 18°C</span>
          <span className="flex items-center gap-1"><Wind className="w-3 h-3 text-blue-400"/> 2 m/s</span>
        </div>
        <button onClick={() => signOut({ callbackUrl: '/login' })} className="flex items-center gap-1 hover:text-red-400 transition-colors">
          <LogOut className="w-3 h-3" /> WYLOGUJ
        </button>
      </div>

      {/* WHITE HEADER */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2 uppercase italic">
            <Sprout className="w-8 h-8 text-green-600"/> agrotechniczne<span className="text-green-600">.pl</span>
          </h1>
          <nav className="flex gap-8">
            <button onClick={() => setActiveTab('fields')} className={cn("py-2 text-[11px] font-black uppercase tracking-widest border-b-2 transition-all", activeTab === 'fields' ? "border-green-600 text-green-700" : "border-transparent text-slate-400")}>2. Pola</button>
            <button onClick={() => setActiveTab('warehouse')} className={cn("py-2 text-[11px] font-black uppercase tracking-widest border-b-2 transition-all", activeTab === 'warehouse' ? "border-green-600 text-green-700" : "border-transparent text-slate-400")}>3. Magazyn</button>
          </nav>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto p-8 animate-in fade-in">
        {activeTab === 'fields' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-800">Twoje Pola</h2>
              <button onClick={() => setModalOpen(true)} className="bg-green-600 hover:bg-green-700 text-white font-black px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-green-200 uppercase text-xs tracking-widest transition-all">
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
                      <button className="text-blue-600 hover:bg-blue-50 p-2 rounded-xl"><Pencil size={16}/></button>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
           <div className="bg-white rounded-[40px] p-10 w-full max-w-md shadow-2xl relative animate-in zoom-in-95">
              <button onClick={() => setModalOpen(false)} className="absolute top-8 right-8 text-slate-400 p-1 hover:bg-slate-50 rounded-full"><X /></button>
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