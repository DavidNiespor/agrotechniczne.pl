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

export const FarmManager = ({ session, initialFields = [], initialWarehouse = [] }) => {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState('treatment');
  
  // Dane z bazy wstrzyknięte w Twoją strukturę
  const [fields, setFields] = useState(initialFields.map(f => ({
    id: f.id, name: f.name, parcelNumber: f.parcelNumber || '', area: f.area, crop: f.cropType
  })));

  const [warehouse, setWarehouse] = useState(initialWarehouse.map(w => ({
    id: w.id, name: w.name, quantity: w.quantity, unit: w.unit, batchNumber: w.batchNumber || '',
    expiryDate: w.expirationDate ? new Date(w.expirationDate).toISOString().split('T')[0] : '',
    productionDate: w.productionDate ? new Date(w.productionDate).toISOString().split('T')[0] : '',
    type: 'Herbicyd', activeSubstance: '', crops: '', recommendedDose: ''
  })));

  const [machines, setMachines] = useState([
    { id: '1', name: 'Pilmet 2500', capacity: 2500, inspectionDate: '2026-05-20' }
  ]);
  const [treatments, setTreatments] = useState([]);

  // MODALS STATE
  const [modalOpen, setModalOpen] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  // --- CRUD HANDLERS (LOGIKA DLA PRZYCISKÓW) ---
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
    <div className="bg-slate-100 min-h-screen pb-20 font-sans text-slate-900 print:bg-white print:pb-0">
      
      {/* 1. CZARNY PASEK POGODY */}
      <div className="bg-slate-900 text-white p-2 px-6 flex justify-between items-center text-[10px] font-bold tracking-widest uppercase print:hidden">
        <div className="flex gap-6 items-center">
          <span className="text-slate-500 font-black uppercase">Pogoda (Lokalna)</span>
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
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Sprout className="w-8 h-8 text-green-600"/> 
            <span>agrotechniczne<span className="text-green-600">.pl</span></span>
          </h1>
          <div className="hidden md:flex items-center gap-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">
            <span>Magazyn: {warehouse.length}</span>
            <span>Pola: {fields.length}</span>
          </div>
        </div>
        
        {/* 3. NAWIGACJA POZIOMA */}
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
      </div>

      {/* 4. CONTENT */}
      <main className="max-w-7xl mx-auto p-8 animate-in fade-in">
        
        {/* POLA */}
        {activeTab === 'fields' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Twoje Pola</h2>
              <button onClick={() => { setEditingItem(null); setModalOpen('field'); }} className="btn-primary">
                <Plus className="w-5 h-5" /> DODAJ POLE
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {fields.map(f => (
                <div key={f.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">{f.parcelNumber}</div>
                    <div className="text-right font-black text-2xl text-slate-800">{f.area} <span className="text-[10px] uppercase text-slate-400">ha</span></div>
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 mt-1">{f.name}</h3>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <span className="px-2 py-1 rounded bg-green-100 text-green-800 font-bold text-[10px] uppercase tracking-widest">{f.crop}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MAGAZYN */}
        {activeTab === 'warehouse' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Magazyn</h2>
              <button onClick={() => { setEditingItem(null); setModalOpen('chemical'); }} className="btn-primary bg-blue-600">
                <Plus className="w-5 h-5" /> DODAJ ŚRODEK
              </button>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  <tr><th className="p-4">Środek</th><th className="p-4">Ilość</th><th className="p-4">Partia</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-bold text-sm">
                  {warehouse.map(w => (
                    <tr key={w.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">{w.name}</td>
                      <td className="p-4 text-blue-600">{w.quantity} {w.unit}</td>
                      <td className="p-4 text-slate-400 font-mono">{w.batchNumber}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* 5. MODALE (DODAWANIE) */}
      {modalOpen === 'field' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
           <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative animate-in zoom-in-95">
              <button onClick={() => setModalOpen(null)} className="absolute top-6 right-6 p-1 hover:bg-gray-100 rounded-full"><X className="w-6 h-6 text-slate-400"/></button>
              <h3 className="text-xl font-black text-slate-800 uppercase mb-6 tracking-tighter">Nowe Pole</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                handleSaveField({ id: Math.random().toString(), name: fd.get('name'), parcelNumber: fd.get('parcel'), area: Number(fd.get('area')), crop: fd.get('crop') });
              }} className="space-y-4">
                 <div><label className="label">Nazwa Pola</label><input name="name" className="input-field" required /></div>
                 <div className="grid grid-cols-2 gap-4">
                   <div><label className="label">Nr Działki</label><input name="parcel" className="input-field" required /></div>
                   <div><label className="label">Obszar (ha)</label><input name="area" type="number" step="0.01" className="input-field" required /></div>
                 </div>
                 <div><label className="label">Uprawa</label><input name="crop" className="input-field" required /></div>
                 <button type="submit" className="w-full bg-slate-900 text-white font-black py-4 rounded-xl mt-4 uppercase text-xs tracking-widest">Zapisz Pole</button>
              </form>
           </div>
        </div>
      )}

      {/* TWOJE STYLE CSS */}
      <style jsx global>{`
        .input-field { width: 100%; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 0.75rem; background: #f8fafc; font-weight: 700; outline: none; }
        .label { display: block; font-size: 0.65rem; font-weight: 900; color: #64748b; text-transform: uppercase; margin-bottom: 0.35rem; tracking: 0.1em; }
        .btn-primary { background: #16a34a; color: white; font-weight: 900; padding: 0.75rem 1.5rem; border-radius: 0.75rem; display: flex; align-items: center; gap: 0.5rem; text-transform: uppercase; font-size: 0.7rem; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}