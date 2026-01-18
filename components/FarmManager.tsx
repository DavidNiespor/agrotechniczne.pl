// @ts-nocheck
'use client';

import React, { useState, useMemo } from 'react';
import { 
  Sprout, Tractor, FlaskConical, FileText, Plus, Trash2, Pencil, Save, X, 
  CheckCircle2, Droplets, Wind, Thermometer, Calendar, LayoutGrid, Check, 
  AlertCircle, Printer, CloudSun, AlertTriangle, Search, Undo2, ShieldCheck, 
  ChevronDown, ChevronUp, ChevronRight, Hourglass, Clock, Package, Archive, 
  History, Recycle, Trash, Ban, Truck, LogOut
} from 'lucide-react';
import { cn } from "@/lib/utils";

// --- PROPSY ---
interface FarmManagerProps {
  initialFields?: any[];
  initialWarehouse?: any[];
  initialTreatments?: any[];
}

export const FarmManager: React.FC<FarmManagerProps> = ({ 
  initialFields = [], 
  initialWarehouse = [], 
  initialTreatments = [] 
}) => {
  // PODPIĘCIE DANYCH Z BAZY DO STANÓW
  const [fields, setFields] = useState(initialFields);
  const [warehouse, setWarehouse] = useState(initialWarehouse);
  const [treatments, setTreatments] = useState(initialTreatments);
  
  const [activeTab, setActiveTab] = useState('dashboard');

  // STATYSTYKI LICZONE NA ŻYWO Z TWOICH DANYCH
  const stats = useMemo(() => ({
    totalArea: fields.reduce((sum, f) => sum + (parseFloat(f.area) || 0), 0),
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
      {/* SIDEBAR - IDENTYCZNY JAK W AI STUDIO */}
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
          
          {/* GUZIK WYLOGUJ - DODANY DO SIDEBARU W TWOIM STYLU */}
          <a 
            href="/api/auth/signout"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all mt-8"
          >
            <LogOut className="w-5 h-5" />
            Wyloguj się
          </a>
        </nav>
      </aside>

      {/* GŁÓWNA TREŚĆ - WYGLĄD AI STUDIO */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* WIDOK PULPITU - IDENTYCZNE KAFELKI */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-200 transition-colors">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Powierzchnia</p>
                    <p className="text-2xl font-black text-slate-800">{stats.totalArea.toFixed(2)} ha</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Liczba Pól</p>
                    <p className="text-2xl font-black text-slate-800">{stats.fieldCount}</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Magazyn</p>
                    <p className="text-2xl font-black text-slate-800">{stats.warehouseValue}</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Zabiegi</p>
                    <p className="text-2xl font-black text-slate-800">{stats.recentTreatments}</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest">Twoje Dane</h3>
                  </div>
                  <div className="p-8 text-center">
                    {fields.length === 0 ? (
                      <div className="py-12">
                         <Sprout className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                         <p className="text-slate-400 font-medium">Brak danych w bazie. Użyj formularzy w zakładkach, aby dodać pierwsze dane.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                        {fields.map(f => (
                          <div key={f.id} className="p-4 border border-slate-100 rounded-xl bg-white shadow-sm">
                            <p className="font-bold text-slate-800">{f.name}</p>
                            <p className="text-xs text-slate-400 uppercase font-bold">{f.area} ha • {f.cropType || f.crop}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Tutaj możesz dokleić sekcje Fields/Warehouse/Treatments z oryginału AI Studio */}
          </div>
        </main>
      </div>
    </div>
  );
};