// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { signOut } from "next-auth/react";
import { Sprout, Plus, X, Droplets, Wind, Thermometer, LayoutGrid, LogOut } from 'lucide-react';
import { cn } from "@/lib/utils";

export const FarmManager = ({ session, initialFields = [] }) => {
  const [activeTab, setActiveTab] = useState('fields');
  const [fields, setFields] = useState(initialFields);
  const [modalOpen, setModalOpen] = useState(false);

  const handleSaveField = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const itemData = {
      name: formData.get('name'),
      parcel: formData.get('parcel'),
      area: formData.get('area'),
      crop: formData.get('crop')
    };

    const res = await fetch('/api/fields', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData),
    });

    const result = await res.json();

    if (res.ok) {
      setFields(prev => [...prev, result]);
      setModalOpen(false);
    } else {
      // Tu obsłużymy ten błąd "Brak autoryzacji" ze screena
      alert("Błąd serwera: " + result.error);
      if (res.status === 401) signOut({ callbackUrl: '/login' });
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-900 pb-20">
      {/* TWOJA GÓRA (CZARNY PASEK) */}
      <div className="bg-slate-900 text-white p-2 px-6 flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
        <div className="flex gap-4">
          <span>agrotechniczne.pl</span>
          <span className="flex items-center gap-1"><Thermometer size={12}/> 18°C</span>
        </div>
        <button onClick={() => signOut()} className="flex items-center gap-1 hover:text-red-400 font-black"><LogOut size={12}/> WYLOGUJ</button>
      </div>

      {/* HEADER (BIAŁY) */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2 uppercase italic">
            <Sprout size={32} className="text-green-600"/> agrotechniczne.pl
          </h1>
          <nav className="flex gap-8">
            <button onClick={() => setActiveTab('fields')} className={cn("px-4 py-2 text-xs font-black uppercase border-b-2", activeTab === 'fields' ? "border-green-600 text-green-700" : "border-transparent text-slate-400")}>
              2. Pola
            </button>
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black uppercase text-slate-800">Twoje Pola</h2>
          <button onClick={() => setModalOpen(true)} className="bg-green-600 text-white font-black px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg uppercase text-xs">
            <Plus size={18} /> DODAJ POLE
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {fields.map(f => (
            <div key={f.id} className="bg-white rounded-[32px] border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
               <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">{f.parcelNumber}</div>
               <div className="text-3xl font-black text-slate-800">{f.area} ha</div>
               <h3 className="font-bold text-lg text-slate-900 mt-1">{f.name}</h3>
               <div className="mt-4"><span className="px-3 py-1 rounded-full bg-green-100 text-green-800 font-black text-[10px] uppercase">{f.cropType || f.crop}</span></div>
            </div>
          ))}
        </div>
      </main>

      {/* MODAL (TWOJA ORYGINALNA FORMA) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
           <div className="bg-white rounded-[40px] p-10 w-full max-w-md shadow-2xl relative">
              <button onClick={() => setModalOpen(false)} className="absolute top-8 right-8 text-slate-400"><X /></button>
              <h3 className="text-2xl font-black text-slate-800 uppercase mb-8 text-center">Nowe Pole</h3>
              <form onSubmit={handleSaveField} className="space-y-4">
                 <input name="name" placeholder="Nazwa Pola" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" required />
                 <div className="grid grid-cols-2 gap-4">
                    <input name="parcel" placeholder="Nr Działki" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" required />
                    <input name="area" type="number" step="0.01" placeholder="Obszar ha" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" required />
                 </div>
                 <input name="crop" placeholder="Uprawa" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" required />
                 <button type="submit" className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl mt-4 uppercase text-xs">ZAPISZ POLE W BAZIE</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};