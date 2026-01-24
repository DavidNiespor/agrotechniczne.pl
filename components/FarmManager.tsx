// @ts-nocheck
'use client';

import React, { useState, useMemo } from 'react';
import { signOut } from "next-auth/react";
import { 
  Sprout, Tractor, FlaskConical, FileText, Plus, Trash2, Pencil, Save, X, 
  CheckCircle2, Droplets, Wind, Thermometer, Calendar, LayoutGrid, Check, 
  AlertCircle, Printer, CloudSun, AlertTriangle, Search, Undo2, ShieldCheck, 
  ChevronDown, ChevronUp, ChevronRight, Hourglass, Clock, Package, Archive, 
  History, Recycle, Trash, Ban, Truck, LogOut
} from 'lucide-react';
import { cn } from "@/lib/utils";

export const FarmManager = ({ session, initialFields = [], initialWarehouse = [] }) => {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState('treatment');
  const [modalOpen, setModalOpen] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState([]);

  // Inicjalizacja danymi z bazy
  const [fields, setFields] = useState(initialFields.map(f => ({
    id: f.id, name: f.name, parcel: f.parcelNumber || '', area: f.area, crop: f.cropType
  })));

  const [warehouse, setWarehouse] = useState(initialWarehouse.map(w => ({
    id: w.id, name: w.name, quantity: w.quantity, unit: w.unit, batch: w.batchNumber || '',
    expiry: w.expirationDate ? new Date(w.expirationDate).toISOString().split('T')[0] : ''
  })));

  // --- LOGIKA ZAPISU ---
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

  if (res.ok) {
    const saved = await res.json();
    setFields(prev => [...prev, {
      id: saved.id,
      name: saved.name,
      parcel: saved.parcelNumber,
      area: saved.area,
      crop: saved.cropType
    }]);
    setModalOpen(null);
  } else {
    const errorData = await res.json();
    alert("Błąd serwera: " + errorData.error);
  }
};

  return (
    <div className="bg-[#f1f5f9] min-h-screen pb-20 font-sans text-slate-900">
      
      {/* 1. BLACK BAR */}
      <div className="bg-[#0f172a] text-white p-2 px-6 flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
        <div className="flex gap-6 items-center">
          <span className="text-slate-500 italic tracking-tighter">agrotechniczne.pl</span>
          <span className="flex items-center gap-1"><Thermometer className="w-3 h-3 text-red-400"/> 18°C</span>
          <span className="flex items-center gap-1"><Wind className="w-3 h-3 text-blue-400"/> 2 m/s</span>
          <span className="flex items-center gap-1"><Droplets className="w-3 h-3 text-blue-300"/> 65%</span>
        </div>
        <button onClick={() => signOut({ callbackUrl: '/login' })} className="flex items-center gap-2 hover:text-red-400 transition-colors">
          <LogOut className="w-3 h-3" /> WYLOGUJ
        </button>
      </div>

      {/* 2. HEADER */}
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
          {[
            { id: 'treatment', label: '1. Nowy Zabieg', icon: Droplets },
            { id: 'fields', label: '2. Pola', icon: LayoutGrid },
            { id: 'warehouse', label: '3. Magazyn', icon: FlaskConical },
            { id: 'machines', label: '4. Maszyny', icon: Tractor },
            { id: 'reports', label: '5. Raporty', icon: FileText }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn(
              "px-8 py-5 text-[11px] font-black uppercase tracking-widest border-b-2 transition-all whitespace-nowrap",
              activeTab === tab.id ? "border-green-600 text-green-700 bg-green-50/30" : "border-transparent text-slate-400"
            )}>
              {tab.label}
            </button>
          ))}</nav></div>
      </div>

      {/* 3. CONTENT */}
      <main className="max-w-7xl mx-auto p-8 animate-in fade-in">
        {activeTab === 'fields' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black uppercase tracking-tighter">Twoje Pola</h2>
              <button onClick={() => setModalOpen('field')} className="bg-green-600 hover:bg-green-700 text-white font-black px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-green-200 uppercase text-xs tracking-widest transition-all">
                <Plus className="w-5 h-5" /> DODAJ POLE
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {fields.map(f => (
                <div key={f.id} className="bg-white rounded-[32px] border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
                   <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{f.parcel}</div>
                   <div className="text-3xl font-black text-slate-800">{f.area} ha</div>
                   <h3 className="font-bold text-lg text-slate-900 mt-1">{f.name}</h3>
                   <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                      <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 font-black text-[10px] uppercase">{f.crop}</span>
                      <button className="text-blue-600 hover:bg-blue-50 p-2 rounded-xl transition-all"><Pencil size={16}/></button>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'warehouse' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black uppercase tracking-tighter">Magazyn Środków</h2>
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
               <table className="w-full text-left font-bold text-sm">
                  <thead className="bg-slate-50 border-b text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    <tr><th className="p-4">Środek</th><th className="p-4">Ilość</th><th className="p-4">Partia</th></tr>
                  </thead>
                  <tbody>
                    {warehouse.map(w => (
                      <tr key={w.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="p-4">{w.name}</td>
                        <td className="p-4 text-blue-600">{w.quantity} {w.unit}</td>
                        <td className="p-4 text-slate-400 font-mono text-xs">{w.batch}</td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}
      </main>

      {/* 4. MODAL */}
      {modalOpen === 'field' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
           <div className="bg-white rounded-[40px] p-10 w-full max-w-md shadow-2xl relative animate-in zoom-in-95">
              <button onClick={() => setModalOpen(null)} className="absolute top-8 right-8 text-slate-400 p-1 hover:bg-slate-50 rounded-full transition-colors"><X /></button>
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

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};