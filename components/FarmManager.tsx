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

// --- KONSTRUKCJA KOMPONENTU ---
export const FarmManager = ({ session, initialFields = [], initialWarehouse = [] }) => {
  
  // 1. DANE Z BAZY (Bez Twoich zmian w UI)
  const [fields, setFields] = useState(initialFields.map(f => ({
    id: f.id, name: f.name, area: f.area, crop: f.cropType, parcelNumber: f.parcelNumber || ''
  })));

  const [warehouse, setWarehouse] = useState(initialWarehouse.map(w => ({
    id: w.id, name: w.name, quantity: w.quantity, unit: w.unit, batchNumber: w.batchNumber || '',
    expiryDate: w.expirationDate ? new Date(w.expirationDate).toISOString().split('T')[0] : '',
    type: 'Środek', activeSubstance: '', crops: ''
  })));

  const [machines, setMachines] = useState([
    { id: '1', name: 'Pilmet 2500', capacity: 2500, inspectionDate: '2026-05-20' }
  ]);
  
  const [treatments, setTreatments] = useState([]);

  // 2. STANY UI (Twoje oryginalne)
  const [activeTab, setActiveTab] = useState('treatment');
  const [modalOpen, setModalOpen] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  // 3. LOGIKA PRZYCISKÓW (Dodawanie/Zapisywanie)
  const handleSaveField = (item) => {
    setFields(prev => editingItem ? prev.map(i => i.id === item.id ? item : i) : [...prev, item]);
    setModalOpen(null);
  };

  const handleSaveChemical = (item) => {
    setWarehouse(prev => editingItem ? prev.map(i => i.id === item.id ? item : i) : [...prev, item]);
    setModalOpen(null);
  };

  const handleSaveMachine = (item) => {
    setMachines(prev => editingItem ? prev.map(i => i.id === item.id ? item : i) : [...prev, item]);
    setModalOpen(null);
  };

  return (
    <div className="bg-slate-100 min-h-screen pb-20 font-sans text-slate-900">
      
      {/* TWOJA GÓRA: POGODA */}
      <div className="bg-slate-900 text-white p-2 px-6 flex justify-between items-center text-[10px] font-bold tracking-widest uppercase">
        <div className="flex gap-6 items-center">
          <span>PARAMETRY: 18°C | 2 m/s | 65%</span>
        </div>
        <button onClick={() => signOut({ callbackUrl: '/login' })} className="hover:text-red-400 flex items-center gap-1 border-l border-slate-700 pl-4">
          <LogOut className="w-3 h-3" /> WYLOGUJ
        </button>
      </div>

      {/* TWOJE LOGO I STATYSTYKI */}
      <div className="bg-white border-b border-gray-300 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <Sprout className="w-8 h-8 text-green-600" />
          <span className="text-2xl font-black text-slate-800 tracking-tight italic">AGRO<span className="text-green-600">PRO</span></span>
        </div>
        <div className="flex gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>MAGAZYN: {warehouse.length}</span>
            <span>POLA: {fields.length}</span>
        </div>
      </div>

      {/* TWOJA NAWIGACJA ZAKŁADEK */}
      <div className="bg-white border-b border-slate-200 px-6 overflow-x-auto">
        <nav className="flex gap-8">
          {[
            { id: 'treatment', label: '1. Nowy Zabieg' },
            { id: 'fields', label: '2. Pola' },
            { id: 'warehouse', label: '3. Magazyn' },
            { id: 'machines', label: '4. Maszyny' },
            { id: 'reports', label: '5. Raporty' }
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn(
              "py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all",
              activeTab === tab.id ? "border-green-600 text-green-700" : "border-transparent text-slate-400"
            )}>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <main className="max-w-7xl mx-auto p-8 animate-in fade-in">
        
        {/* WIDOK: NOWY ZABIEG */}
        {activeTab === 'treatment' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Kreator Zabiegu</h2>
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <label className="label">Wybierz Pola</label>
                     <div className="grid grid-cols-2 gap-2">
                        {fields.map(f => (
                           <div key={f.id} className="p-3 bg-slate-50 border rounded-xl font-bold text-xs hover:border-green-500 cursor-pointer">
                              {f.name} ({f.area} ha)
                           </div>
                        ))}
                     </div>
                  </div>
                  <div className="space-y-4">
                     <label className="label">Szczegóły</label>
                     <input type="date" className="input-field" defaultValue={new Date().toISOString().split('T')[0]} />
                     <button className="w-full bg-green-600 text-white font-black py-4 rounded-xl shadow-lg shadow-green-200 uppercase text-xs tracking-widest">Zatwierdź Zabieg</button>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* WIDOK: POLA */}
        {activeTab === 'fields' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Twoje Pola</h2>
              <button onClick={() => { setEditingItem(null); setModalOpen('field'); }} className="btn-primary">
                <Plus className="w-5 h-5" /> DODAJ POLE
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {fields.map(f => (
                <div key={f.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="font-black text-slate-800 text-lg leading-tight">{f.name}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase mt-1">{f.area} ha • {f.crop}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WIDOK: MAGAZYN */}
        {activeTab === 'warehouse' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Magazyn</h2>
              <button onClick={() => { setEditingItem(null); setModalOpen('chemical'); }} className="btn-primary bg-blue-600">
                <Plus className="w-5 h-5" /> DODAJ ŚRODEK
              </button>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
               <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b text-[10px] font-black uppercase text-slate-400">
                    <tr><th className="p-4">Środek</th><th className="p-4">Ilość</th><th className="p-4">Partia</th></tr>
                  </thead>
                  <tbody>
                     {warehouse.map(w => (
                        <tr key={w.id} className="border-b border-slate-100 font-bold text-sm">
                          <td className="p-4">{w.name}</td>
                          <td className="p-4 text-blue-600">{w.quantity} {w.unit}</td>
                          <td className="p-4 text-slate-400">{w.batchNumber}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}

      </main>

      {/* TWOJE MODALE (Dodawanie pól/środków) */}
      {modalOpen === 'field' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
           <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative animate-in zoom-in-95">
              <button onClick={() => setModalOpen(null)} className="absolute top-6 right-6 p-1 hover:bg-gray-100 rounded-full"><X className="w-6 h-6 text-slate-400"/></button>
              <h3 className="text-xl font-black text-slate-800 uppercase mb-6">Nowe Pole</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                handleSaveField({ id: Math.random().toString(), name: fd.get('name'), area: Number(fd.get('area')), crop: fd.get('crop') });
              }} className="space-y-4">
                 <div><label className="label">Nazwa</label><input name="name" className="input-field" required /></div>
                 <div className="grid grid-cols-2 gap-4">
                    <div><label className="label">Obszar (ha)</label><input name="area" type="number" step="0.01" className="input-field" required /></div>
                    <div><label className="label">Uprawa</label><input name="crop" className="input-field" required /></div>
                 </div>
                 <button type="submit" className="w-full bg-slate-900 text-white font-black py-4 rounded-xl mt-4 uppercase text-xs tracking-widest">Zapisz Pole</button>
              </form>
           </div>
        </div>
      )}

      {/* CSS (Twoje oryginalne style) */}
      <style jsx global>{`
        .input-field { width: 100%; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 0.75rem; background: #f8fafc; font-weight: 700; outline: none; transition: all 0.2s; }
        .input-field:focus { border-color: #16a34a; background: #fff; }
        .label { display: block; font-size: 0.65rem; font-weight: 900; color: #64748b; text-transform: uppercase; margin-bottom: 0.35rem; tracking: 0.1em; }
        .btn-primary { background: #16a34a; color: white; font-weight: 900; padding: 0.75rem 1.5rem; border-radius: 0.75rem; display: flex; align-items: center; gap: 0.5rem; text-transform: uppercase; font-size: 0.7rem; }
      `}</style>
    </div>
  );
};