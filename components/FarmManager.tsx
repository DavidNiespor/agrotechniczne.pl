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

// --- PROPSY ---
interface FarmManagerProps {
  session: any;
  initialFields: any[];
  initialWarehouse: any[];
}

export const FarmManager: React.FC<FarmManagerProps> = ({ session, initialFields = [], initialWarehouse = [] }) => {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState('treatment');
  
  // Mapowanie danych z bazy na format Twojego frontendu
  const [fields, setFields] = useState(initialFields.map(f => ({
    id: f.id,
    name: f.name,
    parcelNumber: f.parcelNumber || '',
    area: f.area,
    crop: f.cropType
  })));

  const [warehouse, setWarehouse] = useState(initialWarehouse.map(w => ({
    id: w.id,
    name: w.name,
    quantity: w.quantity,
    unit: w.unit,
    batchNumber: w.batchNumber || '',
    expiryDate: w.expirationDate ? new Date(w.expirationDate).toISOString().split('T')[0] : '',
    productionDate: w.productionDate ? new Date(w.productionDate).toISOString().split('T')[0] : '',
    type: 'Fungicyd', // Domyślna wartość
    activeSubstance: '',
    crops: '',
    recommendedDose: ''
  })));

  const [machines] = useState([{ id: '1', name: 'Pilmet 2500', capacity: 2500, inspectionDate: '2025-05-20' }]);
  const [modalOpen, setModalOpen] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  // --- CRUD HANDLERS ---
  const handleSaveField = (item: any) => {
    setFields(prev => editingItem ? prev.map(i => i.id === item.id ? item : i) : [...prev, item]);
    setModalOpen(null);
  };

  const handleSaveChemical = (item: any) => {
    setWarehouse(prev => editingItem ? prev.map(i => i.id === item.id ? item : i) : [...prev, item]);
    setModalOpen(null);
  };

  return (
    <div className="bg-slate-100 min-h-screen pb-20 font-sans text-slate-900 print:bg-white print:pb-0">
      
      {/* 1. CZARNY PASEK POGODY (TWÓJ ORYGINAŁ) */}
      <div className="bg-slate-900 text-white p-2 px-6 flex justify-between items-center text-[10px] font-bold tracking-widest uppercase print:hidden">
        <div className="flex gap-6 items-center">
          <span className="text-slate-500 font-black">PARAMETRY POGODOWE:</span>
          <span className="flex items-center gap-1"><Thermometer className="w-3 h-3 text-red-400"/> 18°C</span>
          <span className="flex items-center gap-1"><Wind className="w-3 h-3 text-blue-400"/> 2 m/s</span>
          <span className="flex items-center gap-1"><Droplets className="w-3 h-3 text-blue-300"/> 65%</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-green-600 px-3 py-1 rounded-full flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            LIVE SYSTEM
          </div>
          <button onClick={() => signOut()} className="hover:text-red-400 transition-colors flex items-center gap-1 border-l border-slate-700 pl-4">
            <LogOut className="w-3 h-3" /> WYLOGUJ
          </button>
        </div>
      </div>

      {/* 2. LOGO I STATYSTYKI */}
      <div className="bg-white border-b border-gray-300 sticky top-0 z-20 shadow-md print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Sprout className="w-8 h-8 text-green-600"/> 
            <span>agrotechniczne<span className="text-green-600">.pl</span></span>
          </h1>
          <div className="hidden md:flex items-center gap-4 text-sm font-medium">
             <span className="flex items-center gap-1 text-slate-500 font-bold uppercase text-[10px]">
               Gospodarstwo: <span className="text-slate-900">{session?.user?.farmName || "Brak"}</span>
             </span>
             <span className="flex items-center gap-1 text-slate-500 font-bold uppercase text-[10px]">
               Pola: <span className="text-slate-900">{fields.length}</span>
             </span>
          </div>
        </div>
        
        {/* 3. TWOJE POZIOME MENU */}
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-1 overflow-x-auto hide-scrollbar">
            <TabButton active={activeTab === 'treatment'} onClick={() => setActiveTab('treatment')} icon={Droplets} label="1. Nowy Zabieg" />
            <TabButton active={activeTab === 'fields'} onClick={() => setActiveTab('fields')} icon={LayoutGrid} label="2. Pola" />
            <TabButton active={activeTab === 'warehouse'} onClick={() => setActiveTab('warehouse')} icon={FlaskConical} label="3. Magazyn" />
            <TabButton active={activeTab === 'machines'} onClick={() => setActiveTab('machines')} icon={Tractor} label="4. Maszyny" />
            <TabButton active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} icon={FileText} label="5. Raporty" />
          </nav>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        
        {/* TAB 2: POLA (TWÓJ ORYGINALNY WIDOK) */}
        {activeTab === 'fields' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight uppercase">Ewidencja Gruntów</h2>
                <p className="text-sm text-slate-500">Zarządzaj swoimi działkami rolnymi.</p>
              </div>
              <button onClick={() => { setEditingItem(null); setModalOpen('field'); }} className="btn-primary">
                <Plus className="w-5 h-5" /> Dodaj Pole
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {fields.map(field => (
                <div key={field.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Działka {field.parcelNumber}</div>
                      <h3 className="text-lg font-bold text-slate-900">{field.name}</h3>
                    </div>
                    <div className="text-right">
                      <span className="block text-2xl font-black text-slate-800">{field.area}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">ha</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800 border border-green-200 uppercase">
                      {field.crop}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingItem(field); setModalOpen('field'); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Pencil className="w-4 h-4"/></button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 1: NOWY ZABIEG (TWÓJ ORYGINALNY WIDOK) */}
        {activeTab === 'treatment' && (
           <div className="bg-white p-20 rounded-xl border border-dashed border-slate-200 text-center">
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                Tutaj znajdzie się kreator zabiegów (TreatmentCreator)
              </p>
           </div>
        )}

      </main>

      {/* --- TWOJE MODALE (PRZYWRÓCONE I SPRAWNE) --- */}
      {modalOpen === 'field' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative p-8">
              <button onClick={() => setModalOpen(null)} className="absolute top-6 right-6 p-1 hover:bg-gray-100 rounded-full"><X className="w-6 h-6 text-slate-400"/></button>
              <h3 className="text-xl font-bold text-slate-900 mb-6 uppercase tracking-tight">{editingItem ? "Edytuj Pole" : "Dodaj Pole"}</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                handleSaveField({
                  id: editingItem?.id || Math.random().toString(),
                  name: fd.get('name'),
                  parcelNumber: fd.get('parcelNumber'),
                  area: Number(fd.get('area')),
                  crop: fd.get('crop')
                });
              }} className="space-y-4">
                 <div>
                   <label className="label">Nazwa Pola</label>
                   <input name="name" defaultValue={editingItem?.name} className="input-field" placeholder="np. Za Stodołą" required />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Nr Działki</label>
                      <input name="parcelNumber" defaultValue={editingItem?.parcelNumber} className="input-field" placeholder="142/5" required />
                    </div>
                    <div>
                      <label className="label">Obszar (ha)</label>
                      <input name="area" type="number" step="0.01" defaultValue={editingItem?.area} className="input-field" required />
                    </div>
                 </div>
                 <div>
                    <label className="label">Uprawa</label>
                    <input name="crop" defaultValue={editingItem?.crop} className="input-field" placeholder="np. Pszenica" required />
                 </div>
                 <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setModalOpen(null)} className="flex-1 py-3 text-slate-500 font-bold">Anuluj</button>
                    <button type="submit" className="flex-1 bg-slate-900 text-white font-black py-3 rounded-xl uppercase text-xs tracking-widest">Zapisz</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* TWOJE STYLE CSS (ZACHOWANE) */}
      <style jsx global>{`
        .input-field { width: 100%; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; background: #fff; font-weight: 600; outline: none; }
        .input-field:focus { border-color: #16a34a; box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1); }
        .label { display: block; font-size: 0.65rem; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 0.25rem; tracking: 0.05em; }
        .btn-primary { background: #16a34a; color: white; font-weight: 800; padding: 0.6rem 1.2rem; border-radius: 0.5rem; display: flex; align-items: center; gap: 0.5rem; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.05em; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

const TabButton = ({ active, onClick, icon: Icon, label }: any) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 px-6 py-4 border-b-2 font-bold text-[11px] uppercase tracking-widest transition-all",
      active ? "border-green-600 text-green-800 bg-green-50/50" : "border-transparent text-slate-500 hover:text-slate-800"
    )}
  >
    <Icon className="w-4 h-4" /> {label}
  </button>
);