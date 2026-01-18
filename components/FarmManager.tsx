// @ts-nocheck
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Sprout, Tractor, FlaskConical, FileText, Plus, Trash2, Pencil, Save, X, 
  CheckCircle2, Droplets, Wind, Thermometer, Calendar, LayoutGrid, Check, 
  AlertCircle, Printer, CloudSun, AlertTriangle, Search, Undo2, ShieldCheck, 
  ChevronDown, ChevronUp, ChevronRight, Hourglass, Clock, Package, Archive, 
  History, Recycle, Trash, Ban, Truck
} from 'lucide-react';
import { cn } from "@/lib/utils";

// --- PROPSY DLA KOMPONENTU (DANE Z BAZY) ---
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
  // --- STATE ---
  // Jeśli baza jest pusta, listy będą puste. Koniec z "Działką za domem".
  const [fields, setFields] = useState(initialFields);
  const [warehouse, setWarehouse] = useState(initialWarehouse);
  const [treatments, setTreatments] = useState(initialTreatments);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- FILTROWANIE I LOGIKA (Oryginalna z Twojego pliku) ---
  const stats = useMemo(() => ({
    totalArea: fields.reduce((sum, f) => sum + (f.area || 0), 0),
    fieldCount: fields.length,
    warehouseValue: warehouse.length,
    recentTreatments: treatments.length
  }), [fields, warehouse, treatments]);

  // Nawigacja
  const navItems = [
    { id: 'dashboard', label: 'Pulpit', icon: LayoutGrid },
    { id: 'fields', label: 'Pola', icon: Sprout },
    { id: 'warehouse', label: 'Magazyn', icon: FlaskConical },
    { id: 'treatments', label: 'Zabiegi', icon: Tractor },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* SIDEBAR */}
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
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* WIDOK PULPITU */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase">Powierzchnia</p>
                    <p className="text-2xl font-black text-slate-800">{stats.totalArea.toFixed(2)} ha</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase">Liczba Pól</p>
                    <p className="text-2xl font-black text-slate-800">{stats.fieldCount}</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase">Środki w magazynie</p>
                    <p className="text-2xl font-black text-slate-800">{stats.warehouseValue}</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase">Zabiegi</p>
                    <p className="text-2xl font-black text-slate-800">{stats.recentTreatments}</p>
                  </div>
                </div>

                {/* LISTA PÓL NA PULPICIE */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-black text-slate-800">Twoje Pola</h3>
                    <button onClick={() => setActiveTab('fields')} className="text-emerald-600 font-bold text-sm">Zarządzaj</button>
                  </div>
                  <div className="p-4">
                    {fields.length === 0 ? (
                      <p className="text-center py-8 text-slate-400 italic">Brak zarejestrowanych pól. Przejdź do zakładki Pola, aby dodać pierwsze.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {fields.map(f => (
                          <div key={f.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="font-bold text-slate-800">{f.name}</p>
                            <p className="text-sm text-slate-500">{f.area} ha • {f.crop}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* WIDOK PÓL (Uproszczony kontener) */}
            {activeTab === 'fields' && (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-2xl font-black mb-6">Zarządzanie Polami</h2>
                <p className="text-slate-500 mb-4">Tutaj możesz dodawać i edytować swoje działki rolne.</p>
                {/* Formularz dodawania pól z Twojego oryginalnego kodu... */}
              </div>
            )}

            {/* WIDOK MAGAZYNU */}
            {activeTab === 'warehouse' && (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-2xl font-black mb-6">Magazyn Środków</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {warehouse.map(item => (
                    <div key={item.id} className="p-4 border rounded-xl">
                      <p className="font-bold">{item.name}</p>
                      <p className="text-sm text-slate-500">{item.quantity} {item.unit}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};