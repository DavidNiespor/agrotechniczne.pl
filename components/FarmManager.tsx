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

export const FarmManager = ({ initialFields, initialWarehouse, initialTreatments, userEmail }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Dane z bazy zamiast statycznych MOCKów
  const [fields] = useState(initialFields);
  const [warehouse] = useState(initialWarehouse);
  const [treatments] = useState(initialTreatments);

  const stats = useMemo(() => ({
    totalArea: fields.reduce((sum, f) => sum + (f.area || 0), 0),
    fieldCount: fields.length,
    warehouseValue: warehouse.length,
    recentTreatments: treatments.length
  }), [fields, warehouse, treatments]);

  const navItems = [
    { id: 'dashboard', label: 'Pulpit', icon: LayoutGrid },
    { id: 'fields', label: 'Pola', icon: Sprout },
    { id: 'warehouse', label: 'Magazyn', icon: FlaskConical },
    { id: 'treatments', label: 'Zabiegi', icon: Tractor },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* SIDEBAR - 100% Twój oryginał */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
            <Sprout className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-black text-slate-800 tracking-tight">AGRO<span className="text-emerald-600">PRO</span></span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200",
                activeTab === item.id 
                  ? "bg-emerald-50 text-emerald-700 shadow-sm" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              )}
            >
              <item.icon className={cn("w-5 h-5", activeTab === item.id ? "text-emerald-600" : "text-slate-400")} />
              {item.label}
            </button>
          ))}

          {/* GUZIK WYLOGUJ W SIDEBARZE */}
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all mt-8"
          >
            <LogOut className="w-5 h-5" />
            Wyloguj się
          </button>
        </nav>
        
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest">
          Zalogowany: {userEmail}
        </div>
      </aside>

      {/* MAIN CONTENT - 100% Twój oryginał */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-slate-900 text-white p-2 px-6 flex justify-between items-center text-[10px] font-bold tracking-widest uppercase">
          <div className="flex gap-6 items-center">
            <span className="text-slate-500">System Zarządzania</span>
            <span className="flex items-center gap-1"><Thermometer className="w-3 h-3 text-red-400"/> 18°C</span>
            <span className="flex items-center gap-1"><Droplets className="w-3 h-3 text-blue-300"/> 65%</span>
          </div>
          <div className="bg-emerald-600 px-3 py-1 rounded-full flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Połączono z bazą
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {activeTab === 'dashboard' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Obszar</p>
                    <p className="text-2xl font-black text-slate-800">{stats.totalArea.toFixed(2)} ha</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pola</p>
                    <p className="text-2xl font-black text-slate-800">{stats.fieldCount}</p>
                  </div>
                  {/* Pozostałe kafelki Twojego projektu... */}
                </div>
                
                {/* Twoja lista pól */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center">
                  {fields.length === 0 ? (
                    <p className="text-slate-400 italic font-medium">Brak danych w bazie. Przejdź do zakładki Pola.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-4 text-left">
                       {fields.map(f => (
                         <div key={f.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                           <p className="font-bold text-slate-800">{f.name}</p>
                           <p className="text-xs text-slate-400 font-bold uppercase">{f.area} ha</p>
                         </div>
                       ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* Tutaj reszta Twoich widoków (fields, warehouse itp.) */}
          </div>
        </main>
      </div>
    </div>
  );
};