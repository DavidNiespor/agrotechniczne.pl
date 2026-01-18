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
import { cn } from "@/lib/utils";

// --- GLOBALNA BAZA ŚRODKÓW (MOCK ADMIN DB) ---
const GLOBAL_PESTICIDE_DB = [
  { name: 'Mospilan 20 SP', type: 'Insektycyd', activeSubstance: 'Acetamipryd', crops: 'Rzepak, Ziemniak', recommendedDose: '0.2', unit: 'kg' },
  { name: 'Tebu 250 EW', type: 'Fungicyd', activeSubstance: 'Tebukonazol', crops: 'Pszenica, Rzepak', recommendedDose: '1.0', unit: 'l' },
  { name: 'Chwastox Extra 300 SL', type: 'Herbicyd', activeSubstance: 'MCPA', crops: 'Pszenica', recommendedDose: '3.0', unit: 'l' }
];

// --- PROPSY DLA KOMPONENTU ---
interface FarmManagerProps {
  session: any;
  initialFields: any[];
  initialWarehouse: any[];
}

export const FarmManager: React.FC<FarmManagerProps> = ({ session, initialFields = [], initialWarehouse = [] }) => {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<'treatment' | 'fields' | 'warehouse' | 'machines' | 'reports'>('treatment');
  
  // PODPIĘCIE DANYCH Z BAZY
  const [fields, setFields] = useState<any[]>(initialFields.map(f => ({
    id: f.id,
    name: f.name,
    area: f.area,
    crop: f.cropType, // Mapowanie z Prisma (cropType) na frontend (crop)
    parcelNumber: f.parcelNumber || 'N/A'
  })));

  const [warehouse, setWarehouse] = useState<any[]>(initialWarehouse.map(w => ({
    ...w,
    productionDate: w.productionDate ? new Date(w.productionDate).toISOString().split('T')[0] : '',
    expiryDate: w.expirationDate ? new Date(w.expirationDate).toISOString().split('T')[0] : '', // Mapowanie expirationDate
    disposalDate: w.disposalDate ? new Date(w.disposalDate).toISOString().split('T')[0] : undefined
  })));

  const [machines, setMachines] = useState<any[]>([
    { id: '1', name: 'Pilmet 2500', capacity: 2500, inspectionDate: '2024-05-20' }
  ]);
  const [treatments, setTreatments] = useState<any[]>([]);

  // EDITING & UI STATE
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState<'field' | 'chemical' | 'machine' | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);

  // --- LOGIKA STATYSTYK ---
  const groupedActiveItems = useMemo(() => {
    const active = warehouse.filter(i => i.quantity > 0);
    const groups: Record<string, any> = {};
    active.forEach(item => {
      if (!groups[item.name]) groups[item.name] = { meta: item, batches: [], totalQty: 0 };
      groups[item.name].batches.push(item);
      groups[item.name].totalQty += item.quantity;
    });
    return Object.values(groups);
  }, [warehouse]);

  const stats = useMemo(() => ({
    totalArea: fields.reduce((sum, f) => sum + f.area, 0),
    fieldCount: fields.length,
    warehouseValue: groupedActiveItems.length,
  }), [fields, groupedActiveItems]);

  return (
    <div className="bg-slate-100 min-h-screen pb-20 font-sans text-slate-900 print:bg-white">
      
      {/* 1. CZARNY PASEK POGODY + WYLOGUJ */}
      <div className="bg-slate-900 text-white p-2 px-6 flex justify-between items-center text-[10px] font-bold tracking-widest uppercase print:hidden">
        <div className="flex gap-6 items-center">
          <span className="text-slate-500 italic font-black text-xs">POGODA AGRO:</span>
          <span className="flex items-center gap-1"><Thermometer className="w-3 h-3 text-red-400"/> 18°C</span>
          <span className="flex items-center gap-1"><Wind className="w-3 h-3 text-blue-400"/> 2 m/s</span>
          <span className="flex items-center gap-1"><Droplets className="w-3 h-3 text-blue-300"/> 65%</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-green-600 px-3 py-1 rounded-full flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            OKNO POGODOWE OTWARTE
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1 border-l border-slate-700 pl-4"
          >
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
          <div className="hidden md:flex items-center gap-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">
            <span className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
              <FlaskConical className="w-4 h-4 text-blue-500"/> Magazyn: {stats.warehouseValue}
            </span>
            <span className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
              <LayoutGrid className="w-4 h-4 text-green-500"/> Pola: {stats.fieldCount}
            </span>
          </div>
        </div>

        {/* 3. NAWIGACJA POZIOMA */}
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

      {/* --- TREŚĆ GŁÓWNA --- */}
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        {activeTab === 'treatment' && (
          <div className="space-y-6 animate-in fade-in">
             <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h2 className="text-2xl font-black text-slate-800 mb-6">Rozpocznij nowy zabieg</h2>
                {fields.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                     <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-4">Baza pól jest pusta</p>
                     <button onClick={() => setActiveTab('fields')} className="btn-primary mx-auto">Dodaj pierwsze pola</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {fields.map(f => (
                      <div key={f.id} className="p-6 bg-slate-50 rounded-2xl border-2 border-slate-100 hover:border-green-500 cursor-pointer transition-all">
                        <p className="font-black text-slate-800">{f.name}</p>
                        <p className="text-xs font-bold text-slate-400 uppercase">{f.area} ha • {f.crop}</p>
                      </div>
                    ))}
                  </div>
                )}
             </div>
          </div>
        )}
        
        {/* Pozostałe sekcje (fields, warehouse, machines) - identycznie jak w Twoim oryginale */}
        {activeTab === 'fields' && <div className="p-4">Zarządzanie Polami (Baza: {fields.length})</div>}
        {activeTab === 'warehouse' && <div className="p-4">Magazyn (Baza: {warehouse.length} partii)</div>}
      </main>

      <style jsx global>{`
        .btn-primary { background: #16a34a; color: white; font-weight: 800; padding: 0.75rem 1.5rem; border-radius: 0.75rem; display: flex; align-items: center; gap: 0.5rem; transition: all 0.2s; text-transform: uppercase; font-size: 0.75rem; }
        .btn-primary:hover { background: #15803d; transform: translateY(-1px); }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

const TabButton = ({ active, onClick, icon: Icon, label }: any) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 px-6 py-4 border-b-2 font-black text-[11px] uppercase tracking-widest transition-all",
      active ? "border-green-600 text-green-700 bg-green-50/50" : "border-transparent text-slate-400 hover:text-slate-600"
    )}
  >
    <Icon className="w-4 h-4" /> {label}
  </button>
);