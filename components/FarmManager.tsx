// @ts-nocheck
'use client';

import React, { useState, useMemo } from 'react';
import { signOut } from "next-auth/react";
import { 
  Sprout, Tractor, FlaskConical, FileText, Plus, Trash2, Pencil, X, 
  Droplets, Wind, Thermometer, LayoutGrid, ChevronRight, LogOut
} from 'lucide-react';
import { cn } from "@/lib/utils"

export const FarmManager = ({ session, initialFields = [], initialWarehouse = [] }) => {
  const [activeTab, setActiveTab] = useState('treatment');
  const [fields, setFields] = useState(initialFields.map(f => ({
    id: f.id, name: f.name, parcelNumber: f.parcelNumber || '', area: f.area, crop: f.cropType
  })));
  const [warehouse, setWarehouse] = useState(initialWarehouse.map(w => ({
    id: w.id, name: w.name, quantity: w.quantity, unit: w.unit, batchNumber: w.batchNumber || '',
    expiryDate: w.expirationDate ? new Date(w.expirationDate).toISOString().split('T')[0] : '',
    type: 'Środek'
  })));

  const [modalOpen, setModalOpen] = useState(null);

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
      setFields([...fields, { id: saved.id, name: saved.name, area: saved.area, crop: saved.cropType, parcelNumber: saved.parcelNumber }]);
      setModalOpen(null);
    }
  };

  return (
    <div className="bg-[#f1f5f9] min-h-screen pb-20 font-sans text-slate-900">
      
      {/* 1. CZARNY PASEK POGODY */}
      <div className="bg-[#0f172a] text-white p-2 px-6 flex justify-between items-center text-[10px] font-bold tracking-widest uppercase">
        <div className="flex gap-6 items-center">
          <span className="text-slate-500 font-black italic">agrotechniczne.pl</span>
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
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2 uppercase">
            <Sprout className="w-8 h-8 text-green-600"/> 
            <span>agrotechniczne<span className="text-green-600">.pl</span></span>
          </h1>
          <div className="hidden md:flex items-center gap-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">
            <span className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 font-bold tracking-normal text-slate-900">
               MAGAZYN: {warehouse.length}
            </span>
            <span className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 font-bold tracking-normal text-slate-900">
               POLA: {fields.length}
            </span>
          </div>
        </div>
        
        {/* 3. NAWIGACJA ZAKŁADEK */}
        <div className="max-w-7xl mx-auto px-6 overflow-x-auto">
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

      {/* 4. TREŚĆ GŁÓWNA */}
      <main className="max-w-7xl mx-auto p-8 animate-in fade-in duration-500">
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
                <div key={field.id} className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all group">
                   <div className="flex justify-between items-start">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{field.parcelNumber}</div>
                      <div className="text-right font-black text-2xl text-slate-800">{field.area} ha</div>
                   </div>
                   <h3 className="text-lg font-bold text-slate-900 mt-1">{field.name}</h3>
                   <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                      <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 font-black text-[10px] uppercase tracking-widest">{field.crop}</span>
                      <div className="flex gap-2">
                         <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl"><Pencil className="w-4 h-4"/></button>
                         <button className="p-2 text-red-600 hover:bg-red-50 rounded-xl"><Trash2 className="w-4 h-4"/></button>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'treatment' && (
          <div className="bg-white p-20 rounded-[40px] border border-slate-200 shadow-sm text-center">
             <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Droplets className="w-10 h-10 text-green-600" />
             </div>
             <h2 className="text-3xl font-black text-slate-800 mb-2 uppercase tracking-tighter">Rejestracja Zabiegu</h2>
             <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-12">System gotowy do pracy. Wybierz pola z bazy danych.</p>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {fields.map(f => (
                 <div key={f.id} className="p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl hover:border-green-500 cursor-pointer font-bold text-slate-700 transition-all">
                    {f.name}
                 </div>
               ))}
             </div>
          </div>
        )}
      </main>

      {/* MODALE */}
      {modalOpen === 'field' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
           <div className="bg-white rounded-[40px] p-10 w-full max-w-md shadow-2xl relative">
              <button onClick={() => setModalOpen(null)} className="absolute top-8 right-8 p-1 hover:bg-gray-100 rounded-full text-slate-400"><X className="w-6 h-6"/></button>
              <h3 className="text-2xl font-black text-slate-800 uppercase mb-8 tracking-tighter text-center">Dodaj Nowe Pole</h3>
              <form onSubmit={handleSaveField} className="space-y-4">
                 <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Nazwa Pola</label>
                    <input name="name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:bg-white focus:border-green-500 transition-all" placeholder="np. Za Stodołą" required />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Nr Działki</label>
                      <input name="parcel" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:bg-white focus:border-green-500 transition-all" placeholder="142/5" required />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Obszar (ha)</label>
                      <input name="area" type="number" step="0.01" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:bg-white focus:border-green-500 transition-all" placeholder="0.00" required />
                    </div>
                 </div>
                 <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Uprawa</label>
                    <input name="crop" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:bg-white focus:border-green-500 transition-all" placeholder="np. Pszenica ozima" required />
                 </div>
                 <button type="submit" className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl mt-6 uppercase text-xs tracking-widest hover:bg-black transition-all">ZAPISZ POLE W BAZIE</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};