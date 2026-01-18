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
  // --- STATE ZASILANY Z BAZY ---
  const [activeTab, setActiveTab] = useState('treatment');
  
  const [fields, setFields] = useState(initialFields.map(f => ({
    id: f.id, name: f.name, parcelNumber: f.parcelNumber || '', area: f.area, crop: f.cropType
  })));

  const [warehouse, setWarehouse] = useState(initialWarehouse.map(w => ({
    id: w.id, name: w.name, quantity: w.quantity, unit: w.unit, batchNumber: w.batchNumber || '',
    expiryDate: w.expirationDate ? new Date(w.expirationDate).toISOString().split('T')[0] : '',
    type: 'Herbicyd', activeSubstance: '', crops: '', recommendedDose: ''
  })));

  const [machines, setMachines] = useState([
    { id: '1', name: 'Pilmet 2500', capacity: 2500, inspectionDate: '2026-05-20' }
  ]);
  const [treatments, setTreatments] = useState([]);

  // UI STATE
  const [modalOpen, setModalOpen] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  // --- CRUD HANDLERS (TWOJA LOGIKA) ---
  const handleSaveField = (item) => {
    if (editingItem) setFields(fields.map(i => i.id === item.id ? item : i));
    else setFields([...fields, item]);
    setModalOpen(null);
  };

  const handleSaveChemical = (item) => {
    if (editingItem) setWarehouse(warehouse.map(i => i.id === item.id ? item : i));
    else setWarehouse([...warehouse, item]);
    setModalOpen(null);
  };

  const handleSaveMachine = (item) => {
    if (editingItem) setMachines(machines.map(i => i.id === item.id ? item : i));
    else setMachines([...machines, item]);
    setModalOpen(null);
  };

  // --- RENDERING (TWÓJ ORYGINALNY WYGLĄD) ---
  return (
    <div className="bg-slate-100 min-h-screen pb-20 font-sans text-slate-900 print:bg-white print:pb-0">
      
      {/* NAGŁÓWEK POGODY */}
      <div className="bg-slate-900 text-white print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center text-sm font-bold tracking-widest uppercase">
          <div className="flex gap-6 items-center">
            <span className="text-slate-500 italic">PARAMETRY:</span>
            <span className="flex items-center gap-1"><Thermometer className="w-4 h-4 text-red-400"/> 18°C</span>
            <span className="flex items-center gap-1"><Wind className="w-4 h-4 text-blue-400"/> 2 m/s</span>
            <span className="flex items-center gap-1"><Droplets className="w-4 h-4 text-blue-300"/> 65%</span>
          </div>
          <button onClick={() => signOut()} className="hover:text-red-400 transition-colors flex items-center gap-1 border-l border-slate-700 pl-4 font-black">
            <LogOut className="w-3 h-3" /> WYLOGUJ
          </button>
        </div>
      </div>

      <div className="bg-white border-b border-gray-300 sticky top-0 z-20 shadow-md print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Sprout className="w-8 h-8 text-green-600"/> 
            <span>agrotechniczne<span className="text-green-600">.pl</span></span>
          </h1>
          <div className="hidden md:flex gap-4 text-sm font-bold uppercase tracking-widest text-slate-400">
             <span>MAGAZYN: {warehouse.length}</span>
             <span>POLA: {fields.length}</span>
          </div>
        </div>
        
        <nav className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto hide-scrollbar">
          {['treatment', 'fields', 'warehouse', 'machines', 'reports'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={cn(
              "px-6 py-4 border-b-2 font-black text-[11px] uppercase tracking-widest transition-all",
              activeTab === tab ? "border-green-600 text-green-800 bg-green-50/50" : "border-transparent text-slate-500"
            )}>
              {tab === 'treatment' ? '1. Nowy Zabieg' : tab === 'fields' ? '2. Pola' : tab === 'warehouse' ? '3. Magazyn' : tab === 'machines' ? '4. Maszyny' : '5. Raporty'}
            </button>
          ))}
        </nav>
      </div>

      <main className="max-w-7xl mx-auto p-8 animate-in fade-in">
        
        {activeTab === 'fields' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <SectionHeader title="Ewidencja Gruntów" desc="Zarządzaj swoimi działkami rolnymi." />
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
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="px-2 py-1 rounded bg-green-100 text-green-800 font-bold text-[10px] uppercase tracking-widest">{f.crop}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'treatment' && (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm text-center">
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-4">Rejestracja Zabiegu</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-8">Wybierz pola z bazy danych poniżej</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {fields.map(f => (
                 <div key={f.id} className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl hover:border-green-500 cursor-pointer font-bold text-slate-700">
                    {f.name}
                 </div>
               ))}
            </div>
          </div>
        )}
      </main>

      {/* TWOJE MODALE */}
      {modalOpen === 'field' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
           <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative animate-in zoom-in-95">
              <button onClick={() => setModalOpen(null)} className="absolute top-6 right-6 p-1 hover:bg-gray-100 rounded-full"><X className="w-6 h-6 text-slate-400"/></button>
              <h3 className="text-xl font-black text-slate-800 uppercase mb-6 tracking-tighter">Dodaj Pole</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                handleSaveField({ id: Math.random().toString(), name: fd.get('name'), parcelNumber: fd.get('parcel'), area: Number(fd.get('area')), crop: fd.get('crop') });
              }} className="space-y-4">
                 <FormInput label="Nazwa Pola" name="name" required />
                 <div className="grid grid-cols-2 gap-4">
                   <FormInput label="Nr Działki" name="parcel" required />
                   <FormInput label="Powierzchnia (ha)" name="area" type="number" step="0.01" required />
                 </div>
                 <FormInput label="Uprawa" name="crop" required />
                 <button type="submit" className="w-full bg-slate-900 text-white font-black py-4 rounded-xl mt-4 uppercase text-xs tracking-widest hover:bg-black">ZAPISZ DANE</button>
              </form>
           </div>
        </div>
      )}

      {/* TWOJE STYLE */}
      <style jsx global>{`
        .input-field { width: 100%; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 0.75rem; background: #f8fafc; font-weight: 700; outline: none; transition: all 0.2s; }
        .input-field:focus { border-color: #16a34a; background: #fff; }
        .label { display: block; font-size: 0.65rem; font-weight: 900; color: #64748b; text-transform: uppercase; margin-bottom: 0.35rem; tracking: 0.1em; }
        .btn-primary { background: #16a34a; color: white; font-weight: 900; padding: 0.75rem 1.5rem; border-radius: 0.75rem; display: flex; align-items: center; gap: 0.5rem; text-transform: uppercase; font-size: 0.7rem; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

// --- HELPERY UI ---
const SectionHeader = ({ title, desc }) => (
  <div>
    <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">{title}</h2>
    <p className="text-sm text-slate-500 font-medium uppercase tracking-widest text-[10px]">{desc}</p>
  </div>
);

const FormInput = ({ label, ...props }) => (
  <div>
    <label className="label">{label}</label>
    <input className="input-field" {...props} />
  </div>
);