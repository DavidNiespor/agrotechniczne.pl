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

// --- TYPY DANYCH (ZACHOWANE) ---
interface Field {
  id: string;
  name: string;
  parcelNumber: string;
  area: number;
  crop: string;
}

type ChemType = 'Herbicyd' | 'Fungicyd' | 'Insektycyd' | 'Regulator' | 'Nawoz' | 'Adiuwant';

interface Chemical {
  id: string;
  name: string;
  type: ChemType;
  activeSubstance: string;
  crops: string;
  quantity: number;
  unit: string;
  recommendedDose: string;
  batchNumber: string;
  productionDate: string;
  expiryDate: string;
  disposalDate?: string;
  isWastePending?: boolean;
}

// --- KOMPONENT GŁÓWNY ---
export const FarmManager = ({ session, initialFields = [], initialWarehouse = [] }) => {
  const [activeTab, setActiveTab] = useState('treatment');
  
  // 1. DANE (WSTRZYKNIĘTE Z BAZY DO TWOJEGO STANU)
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

  // 2. STANY UI (TWOJE)
  const [expandedGroups, setExpandedGroups] = useState([]);
  const [modalOpen, setModalOpen] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  // 3. LOGIKA ZAPISYWANIA (CRUD)
  const handleSaveField = async (item) => {
    const res = await fetch('/api/fields', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (res.ok) {
      const saved = await res.json();
      setFields([...fields, { id: saved.id, name: saved.name, area: saved.area, crop: saved.cropType, parcelNumber: saved.parcelNumber }]);
      setModalOpen(null);
    }
  };

  const toggleGroup = (name) => {
    setExpandedGroups(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  };

  return (
    <div className="bg-slate-100 min-h-screen pb-20 font-sans text-slate-900 print:bg-white print:pb-0">
      
      {/* --- TWOJA GÓRA: POGODA --- */}
      <div className="bg-slate-900 text-white p-2 px-6 flex justify-between items-center text-[10px] font-bold tracking-widest uppercase print:hidden">
        <div className="flex gap-6 items-center">
          <span className="text-slate-500 font-black">PARAMETRY POGODOWE:</span>
          <span className="flex items-center gap-1"><Thermometer className="w-3 h-3 text-red-400"/> 18°C</span>
          <span className="flex items-center gap-1"><Wind className="w-3 h-3 text-blue-400"/> {Math.floor(Math.random()*3)+1} m/s</span>
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

      {/* --- TWOJE LOGO I STATYSTYKI --- */}
      <div className="bg-white border-b border-gray-300 sticky top-0 z-20 shadow-md print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2 uppercase">
            <Sprout className="w-8 h-8 text-green-600"/> 
            <span>agrotechniczne<span className="text-green-600">.pl</span></span>
          </h1>
          <div className="hidden md:flex items-center gap-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">
            <span className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
               Magazyn: <span className="text-slate-900">{warehouse.length}</span>
            </span>
            <span className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
               Pola: <span className="text-slate-900">{fields.length} ha</span>
            </span>
          </div>
        </div>
        
        {/* --- TWOJA NAWIGACJA ZAKŁADEK --- */}
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

      <main className="max-w-7xl mx-auto p-8 animate-in fade-in duration-500">
        
        {/* --- ZAKŁADKA POLA (TWOJE KAFELKI) --- */}
        {activeTab === 'fields' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Twoje Pola</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Ewidencja Gruntów Rolnych</p>
              </div>
              <button onClick={() => { setEditingItem(null); setModalOpen('field'); }} className="btn-primary">
                <Plus className="w-5 h-5" /> DODAJ POLE
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {fields.map(field => (
                <div key={field.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all group">
                   <div className="flex justify-between items-start">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Działka {field.parcelNumber}</div>
                      <div className="text-right">
                         <span className="block text-2xl font-black text-slate-800">{field.area}</span>
                         <span className="text-[10px] text-slate-400 font-bold uppercase">ha</span>
                      </div>
                   </div>
                   <h3 className="text-lg font-bold text-slate-900 mt-1">{field.name}</h3>
                   <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800 border border-green-200 uppercase">
                        {field.crop}
                      </span>
                      <div className="flex gap-2">
                         <button className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Pencil className="w-4 h-4"/></button>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* --- MODAL POLA (TWÓJ ORYGINALNY FORMULARZ) --- */}
      {modalOpen === 'field' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
           <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative animate-in zoom-in-95">
              <button onClick={() => setModalOpen(null)} className="absolute top-6 right-6 p-1 hover:bg-gray-100 rounded-full"><X className="w-6 h-6 text-slate-400"/></button>
              <h3 className="text-xl font-black text-slate-800 uppercase mb-6 tracking-tighter">Nowe Pole</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                handleSaveField({ name: fd.get('name'), parcelNumber: fd.get('parcel'), area: fd.get('area'), crop: fd.get('crop') });
              }} className="space-y-4">
                 <div>
                    <label className="label">Nazwa Pola</label>
                    <input name="name" className="input-field" placeholder="np. Za Stodołą" required />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Nr Działki</label>
                      <input name="parcel" className="input-field" placeholder="142/5" required />
                    </div>
                    <div>
                      <label className="label">Obszar (ha)</label>
                      <input name="area" type="number" step="0.01" className="input-field" placeholder="0.00" required />
                    </div>
                 </div>
                 <div>
                    <label className="label">Uprawa</label>
                    <input name="crop" className="input-field" placeholder="np. Pszenica" required />
                 </div>
                 <button type="submit" className="w-full bg-slate-900 text-white font-black py-4 rounded-xl mt-4 uppercase text-xs tracking-widest hover:bg-black transition-all">ZAPISZ DANE</button>
              </form>
           </div>
        </div>
      )}

      {/* --- TWOJE STYLE CSS (ZACHOWANE W 100%) --- */}
      <style jsx global>{`
        .input-field { width: 100%; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 0.75rem; background: #f8fafc; font-weight: 700; outline: none; transition: all 0.2s; }
        .input-field:focus { border-color: #16a34a; background: #fff; box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1); }
        .label { display: block; font-size: 0.65rem; font-weight: 900; color: #64748b; text-transform: uppercase; margin-bottom: 0.35rem; tracking: 0.1em; }
        .btn-primary { background: #16a34a; color: white; font-weight: 900; padding: 0.75rem 1.5rem; border-radius: 0.75rem; display: flex; align-items: center; gap: 0.5rem; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.05em; transition: all 0.2s; }
        .btn-primary:hover { background: #15803d; transform: translateY(-1px); }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};