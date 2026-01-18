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
  
  // Dane z bazy zmapowane na Twój format
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
    type: 'Środek'
  })));

  const [machines] = useState([{ id: '1', name: 'Pilmet 2500', capacity: 2500, inspectionDate: '2025-05-20' }]);
  const [modalOpen, setModalOpen] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  // --- HANDLERS ---
  const handleSaveField = (item) => {
    setFields(prev => editingItem ? prev.map(i => i.id === item.id ? item : i) : [...prev, item]);
    setModalOpen(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* 1. GÓRNY PASEK POGODY (TWÓJ LAYOUT) */}
      <div className="bg-slate-900 text-white p-2 px-6 flex justify-between items-center text-[10px] font-bold tracking-widest uppercase">
        <div className="flex gap-6 items-center">
          <span className="text-slate-500">POGODA (LOKALNA)</span>
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
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <Sprout className="w-8 h-8 text-green-600" />
          <span className="text-2xl font-black text-slate-800 tracking-tight">
            agrotechniczne<span className="text-green-600">.pl</span>
          </span>
        </div>
        <div className="flex gap-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 font-bold text-slate-900">
              Gospodarstwo: {session?.user?.farmName || "Brak"}
            </span>
            <span className="flex items-center gap-1"><FlaskConical className="w-4 h-4 text-blue-500"/> Magazyn: {warehouse.length}</span>
            <span className="flex items-center gap-1"><LayoutGrid className="w-4 h-4 text-green-500"/> Pola: {fields.length}</span>
        </div>
      </div>

      {/* 3. NAWIGACJA ZAKŁADEK */}
      <div className="bg-white border-b border-slate-200 px-6 overflow-x-auto">
        <nav className="flex gap-8">
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
                "flex items-center gap-2 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all",
                activeTab === item.id ? "border-green-600 text-green-700" : "border-transparent text-slate-400 hover:text-slate-600"
              )}
            >
              <item.icon className="w-4 h-4" /> {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* 4. CONTENT */}
      <main className="max-w-7xl mx-auto p-8 animate-in fade-in duration-500">
        {activeTab === 'fields' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Twoje Pola</h2>
              <button onClick={() => { setEditingItem(null); setModalOpen('field'); }} className="bg-green-600 text-white font-black px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-green-200">
                <Plus className="w-5 h-5" /> DODAJ POLE
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {fields.map(f => (
                <div key={f.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-green-500 transition-all">
                  <h3 className="font-black text-slate-800 text-lg leading-tight">{f.name}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase mt-1">{f.area} ha • {f.crop}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 5. MODALE Z FORMULARZAMI (PRZYWRÓCONE) */}
      {modalOpen === 'field' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
           <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
              <button onClick={() => setModalOpen(null)} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full"><X className="w-6 h-6 text-slate-400"/></button>
              <h3 className="text-xl font-black text-slate-800 uppercase mb-6">Dodaj Nowe Pole</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                handleSaveField({
                  id: Math.random().toString(),
                  name: fd.get('name'),
                  parcelNumber: fd.get('parcelNumber'),
                  area: Number(fd.get('area')),
                  crop: fd.get('crop')
                });
              }} className="space-y-4">
                 <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Nazwa Pola</label>
                 <input name="name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold" required /></div>
                 <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Obszar (ha)</label>
                    <input name="area" type="number" step="0.01" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold" required /></div>
                    <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Uprawa</label>
                    <input name="crop" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold" required /></div>
                 </div>
                 <button type="submit" className="w-full bg-slate-900 text-white font-black py-4 rounded-xl mt-4">ZAPISZ POLE</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};