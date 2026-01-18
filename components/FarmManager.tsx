// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { signOut } from "next-auth/react";
import { 
  Sprout, Tractor, FlaskConical, FileText, Plus, Trash2, Pencil, Save, X, 
  CheckCircle2, Droplets, Wind, Thermometer, Calendar, LayoutGrid, Check, 
  AlertCircle, Printer, LogOut
} from 'lucide-react';
import { cn } from "@/lib/utils";

export const FarmManager = ({ session }) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  // --- PRZYKŁADOWE DANE (MOCKI) ---
  const [fields] = useState([
    { id: '1', name: 'Działka pod Lasem', area: 5.4, crop: 'Pszenica ozima' },
    { id: '2', name: 'Klin', area: 2.1, crop: 'Rzepak' },
    { id: '3', name: 'Za Stodołą', area: 3.8, crop: 'Kukurydza' }
  ]);

  const [warehouse] = useState([
    { id: '1', name: 'Atlantis 12 OD', quantity: 5, unit: 'l' },
    { id: '2', name: 'Puma Universal', quantity: 10, unit: 'l' }
  ]);

  const navItems = [
    { id: 'dashboard', label: 'Pulpit', icon: LayoutGrid },
    { id: 'fields', label: 'Pola', icon: Sprout },
    { id: 'warehouse', label: 'Magazyn', icon: FlaskConical },
    { id: 'treatments', label: 'Zabiegi', icon: Tractor },
    { id: 'reports', label: 'Raporty', icon: FileText },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* --- SIDEBAR (PASEK BOCZNY) --- */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-screen sticky top-0">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
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

        {/* DOLNA CZĘŚĆ SIDEBARA (PROFIL + WYLOGUJ) */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs uppercase">
              {session?.user?.email?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{session?.user?.email}</p>
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Plan PRO</p>
            </div>
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            WYLOGUJ SIĘ
          </button>
        </div>
      </aside>

      {/* --- TREŚĆ GŁÓWNA --- */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Pasek Pogody */}
        <header className="bg-slate-900 text-white p-2 px-6 flex justify-between items-center text-[10px] font-bold tracking-widest uppercase">
          <div className="flex gap-6 items-center">
            <span className="text-slate-500">PARAMETRY</span>
            <span className="flex items-center gap-1"><Thermometer className="w-3 h-3 text-red-400"/> 18°C</span>
            <span className="flex items-center gap-1"><Wind className="w-3 h-3 text-blue-400"/> 2 m/s</span>
            <span className="flex items-center gap-1"><Droplets className="w-3 h-3 text-blue-300"/> 65%</span>
          </div>
          <div className="bg-emerald-600 px-3 py-1 rounded-full flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            SYSTEM AKTYWNY
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
           <div className="max-w-5xl mx-auto space-y-8">
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                {navItems.find(i => i.id === activeTab)?.label}
              </h1>

              {/* STATYSTYKI */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: 'Obszar', val: '11.3 ha', color: 'emerald' },
                  { label: 'Pola', val: fields.length, color: 'blue' },
                  { label: 'Magazyn', val: warehouse.length, color: 'amber' },
                  { label: 'Zabiegi', val: '12', color: 'slate' }
                ].map((s, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                    <p className="text-2xl font-black text-slate-800">{s.val}</p>
                  </div>
                ))}
              </div>

              {/* DASHBOARD CONTENT */}
              {activeTab === 'dashboard' && (
                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                    <h3 className="font-black text-slate-800 mb-4">Ostatnie Pola</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {fields.map(f => (
                        <div key={f.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="font-bold text-slate-800">{f.name}</p>
                          <p className="text-xs text-slate-500 font-bold uppercase">{f.area} ha • {f.crop}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
           </div>
        </main>
      </div>
    </div>
  );
};