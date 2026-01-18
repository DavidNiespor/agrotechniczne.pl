// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { signOut } from "next-auth/react";
import { 
  Sprout, Tractor, FlaskConical, FileText, LayoutGrid, Droplets, 
  Thermometer, Wind, LogOut, CheckCircle2 
} from 'lucide-react';
import { cn } from "@/lib/utils";

export const FarmManager = ({ session }) => {
  const [activeTab, setActiveTab] = useState('treatment');

  // TWOJE ORYGINALNE MOCKI
  const fields = [
    { id: '1', name: 'Działka pod Lasem', crop: 'Pszenica ozima', area: 5.4 },
    { id: '2', name: 'Klin', crop: 'Rzepak', area: 2.1 },
    { id: '3', name: 'Za Stodołą', crop: 'Kukurydza', area: 8.5 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* --- CZARNY PASEK GÓRNY (POGODA I LOGOWANIE) --- */}
      <div className="bg-slate-900 text-white p-2 px-6 flex justify-between items-center text-[10px] font-bold tracking-widest uppercase">
        <div className="flex gap-6 items-center">
          <span className="text-slate-500 italic font-black">PARAMETRY POGODOWE:</span>
          <span className="flex items-center gap-1"><Thermometer className="w-3 h-3 text-red-400"/> 18°C</span>
          <span className="flex items-center gap-1"><Wind className="w-3 h-3 text-blue-400"/> 2 m/s</span>
          <span className="flex items-center gap-1"><Droplets className="w-3 h-3 text-blue-300"/> 65%</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-emerald-600 px-3 py-1 rounded-full flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            LIVE SYSTEM
          </div>
          {/* PRZYCISK WYLOGUJ - Wkomponowany w czarny pasek */}
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1 border-l border-slate-700 pl-4"
          >
            <LogOut className="w-3 h-3" /> WYLOGUJ
          </button>
        </div>
      </div>

      {/* --- SEKCJA LOGO I STATYSTYK --- */}
      <div className="bg-white border-b border-slate-200 px-6 py-5 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-100">
            <Sprout className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-black text-slate-800 tracking-tighter uppercase">
            agrotechniczne<span className="text-emerald-600">.pl</span>
          </span>
        </div>
        
        <div className="flex items-center gap-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">
            <span className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
              <FlaskConical className="w-4 h-4 text-blue-500"/> Magazyn: 4 środki
            </span>
            <span className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
              <LayoutGrid className="w-4 h-4 text-emerald-500"/> Pola: {fields.length}
            </span>
        </div>
      </div>

      {/* --- POZIOMA NAWIGACJA (TABS) --- */}
      <div className="bg-white border-b border-slate-200 px-6">
        <nav className="flex gap-1">
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
                  ? "border-emerald-600 text-emerald-700 bg-emerald-50/30" 
                  : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50/50"
              )}
            >
              <item.icon className={cn("w-4 h-4", activeTab === item.id ? "text-emerald-600" : "text-slate-400")} />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* --- TREŚĆ GŁÓWNA --- */}
      <main className="p-8 max-w-7xl mx-auto">
        {activeTab === 'treatment' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="flex justify-between items-end mb-4">
               <div>
                  <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Krok 1</h2>
                  <p className="text-2xl font-black text-slate-800 tracking-tighter">Wybierz pola do zabiegu</p>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Suma obszaru</p>
                  <p className="text-3xl font-black text-emerald-600 tracking-tighter">0.00 ha</p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {fields.map((f) => (
                <div key={f.id} className="bg-white p-6 rounded-2xl border-2 border-slate-100 shadow-sm hover:border-emerald-500 transition-all cursor-pointer group">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                       <Sprout className="w-5 h-5 text-slate-400 group-hover:text-emerald-600" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded uppercase tracking-widest group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">
                      {f.area} ha
                    </span>
                  </div>
                  <h3 className="font-black text-slate-800 mt-4 text-lg tracking-tight leading-tight">{f.name}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase mt-1 tracking-wider">{f.crop}</p>
                </div>
              ))}
            </div>

            {/* Formularz pomocniczy */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm mt-8">
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-8 bg-emerald-600 rounded-full" />
                  <p className="text-sm font-black text-slate-800 uppercase tracking-widest">Dane podstawowe</p>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data Zabiegu</label>
                     <input type="date" defaultValue="2026-01-18" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-800 outline-none focus:border-emerald-500 transition-colors" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gospodarstwo</label>
                     <input type="text" value="Twoje Gospodarstwo" readOnly className="w-full p-4 bg-slate-100 border-2 border-slate-100 rounded-2xl font-black text-slate-400 cursor-not-allowed uppercase tracking-wider" />
                  </div>
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};