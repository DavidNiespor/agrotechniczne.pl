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

// --- TYPY DANYCH ---
interface Field {
  id: string;
  name: string;
  parcelNumber: string;
  area: number;
  crop: string;
}

interface Chemical {
  id: string;
  name: string;
  type: string;
  activeSubstance: string;
  crops: string;
  quantity: number;
  unit: string;
  batchNumber: string;
  productionDate: string;
  expiryDate: string;
  disposalDate?: string;
  isWastePending?: boolean;
}

interface Machine {
  id: string;
  name: string;
  capacity: number;
  inspectionDate: string;
}

interface FarmManagerProps {
  session: any;
  initialFields: any[];
  initialWarehouse: any[];
}

export const FarmManager: React.FC<FarmManagerProps> = ({ session, initialFields = [], initialWarehouse = [] }) => {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<'treatment' | 'fields' | 'warehouse' | 'machines' | 'reports'>('treatment');
  
  // Dane z bazy zmapowane na format frontendu
  const [fields, setFields] = useState<Field[]>(initialFields.map(f => ({
    id: f.id,
    name: f.name,
    parcelNumber: f.parcelNumber || '',
    area: f.area,
    crop: f.cropType // Mapowanie z Prisma cropType
  })));

  const [warehouse, setWarehouse] = useState<Chemical[]>(initialWarehouse.map(w => ({
    id: w.id,
    name: w.name,
    type: 'Środek',
    activeSubstance: '',
    crops: '',
    quantity: w.quantity,
    unit: w.unit,
    batchNumber: w.batchNumber || '',
    productionDate: w.productionDate ? new Date(w.productionDate).toISOString().split('T')[0] : '',
    expiryDate: w.expirationDate ? new Date(w.expirationDate).toISOString().split('T')[0] : '',
    disposalDate: w.disposalDate ? new Date(w.disposalDate).toISOString().split('T')[0] : undefined
  })));

  const [machines, setMachines] = useState<Machine[]>([]);
  const [treatments, setTreatments] = useState<any[]>([]);

  // Modals state
  const [modalOpen, setModalOpen] = useState<'field' | 'chemical' | 'machine' | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);

  // --- HANDLERS ---
  const handleSignOut = () => signOut({ callbackUrl: '/login' });

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-900">
      
      {/* 1. CZARNY PASEK POGODY (GÓRA) */}
      <div className="bg-slate-900 text-white p-2 px-6 flex justify-between items-center text-[10px] font-bold tracking-widest uppercase">
        <div className="flex gap-6 items-center">
          <span className="text-slate-500 font-black">PARAMETRY POGODOWE:</span>
          <span className="flex items-center gap-1"><Thermometer className="w-3 h-3 text-red-400"/> 18°C</span>
          <span className="flex items-center gap-1"><Wind className="w-3 h-3 text-blue-400"/> 2 m/s</span>
          <span className="flex items-center gap-1"><Droplets className="w-3 h-3 text-blue-300"/> 65%</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-green-600 px-3 py-1 rounded-full flex items-center gap-2 font-black">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            LIVE SYSTEM
          </div>
          <button onClick={handleSignOut} className="hover:text-red-400 transition-colors flex items-center gap-1 border-l border-slate-700 pl-4">
            <LogOut className="w-3 h-3" /> WYLOGUJ
          </button>
        </div>
      </div>

      {/* 2. LOGO I STATYSTYKI */}
      <div className="bg-white border-b border-slate-200 px-6 py-5 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
            <Sprout className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-black text-slate-800 tracking-tighter uppercase">
            agrotechniczne<span className="text-green-600">.pl</span>
          </span>
        </div>
        <div className="flex items-center gap-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">
            <span className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 font-bold">
              Gospodarstwo: <span className="text-slate-900">{session?.user?.farmName || "Brak nazwy"}</span>
            </span>
            <span className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
              Pola: <span className="text-slate-900">{fields.length}</span>
            </span>
        </div>
      </div>

      {/* 3. POZIOMA NAWIGACJA ZAKŁADEK */}
      <div className="bg-white border-b border-slate-200 px-6">
        <nav className="flex gap-1 overflow-x-auto hide-scrollbar">
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

      {/* 4. TREŚĆ GŁÓWNA */}
      <main className="max-w-7xl mx-auto p-8 animate-in fade-in duration-500">
        
        {/* ZAKŁADKA: POLA */}
        {activeTab === 'fields' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Twoje Pola</h2>
                <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Ewidencja Gruntów Rolnych</p>
              </div>
              <button onClick={() => setModalOpen('field')} className="bg-green-600 hover:bg-green-700 text-white font-black px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-green-200 transition-all uppercase text-xs tracking-widest">
                <Plus className="w-5 h-5" /> Dodaj Pole
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {fields.length === 0 ? (
                <div className="col-span-3 py-20 text-center bg-white border-2 border-dashed border-slate-200 rounded-3xl">
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Brak pól w bazie. Dodaj pierwsze pole.</p>
                </div>
              ) : (
                fields.map(f => (
                  <div key={f.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-green-500 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                       <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center group-hover:bg-green-50"><Sprout className="w-5 h-5 text-slate-400 group-hover:text-green-600"/></div>
                       <span className="bg-slate-100 text-slate-600 font-black text-[10px] px-2 py-1 rounded uppercase tracking-widest">{f.area} ha</span>
                    </div>
                    <h3 className="font-black text-slate-800 text-lg tracking-tight mb-1">{f.name}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{f.crop}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ZAKŁADKA: MAGAZYN */}
        {activeTab === 'warehouse' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Magazyn Środków</h2>
                <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Stany magazynowe i utylizacja</p>
              </div>
              <button onClick={() => setModalOpen('chemical')} className="bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-200 transition-all uppercase text-xs tracking-widest">
                <Plus className="w-5 h-5" /> Dodaj Środek
              </button>
            </div>
            {/* Tabela magazynu... */}
          </div>
        )}

        {/* ZAKŁADKA: MASZYNY */}
        {activeTab === 'machines' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Park Maszynowy</h2>
                <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Ewidencja opryskiwaczy</p>
              </div>
              <button onClick={() => setModalOpen('machine')} className="bg-slate-800 hover:bg-slate-900 text-white font-black px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg transition-all uppercase text-xs tracking-widest">
                <Plus className="w-5 h-5" /> Dodaj Maszynę
              </button>
            </div>
          </div>
        )}

        {/* DOMYŚLNY WIDOK: NOWY ZABIEG */}
        {activeTab === 'treatment' && (
          <div className="space-y-6">
             <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm text-center">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Droplets className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-black text-slate-800 mb-2">Rejestracja Zabiegu</h2>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-8">Wybierz pola z listy poniżej, aby zacząć</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {fields.map(f => (
                    <div key={f.id} className="p-4 bg-slate-50 rounded-xl border-2 border-slate-100 hover:border-green-500 cursor-pointer transition-all">
                       <p className="font-bold text-slate-800">{f.name}</p>
                       <p className="text-[10px] text-slate-400 font-black uppercase">{f.area} ha</p>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        )}
      </main>

      {/* CSS STYLES - DLA ZGODNOŚCI Z DESIGNEM */}
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};