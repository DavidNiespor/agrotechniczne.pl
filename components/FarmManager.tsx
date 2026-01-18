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

  // MOCKI DOKŁADNIE ZE ZRZUTU
  const fields = [
    { name: 'Działka pod Lasem', crop: 'Pszenica ozima', area: 5.4 },
    { name: 'Klin', crop: 'Rzepak', area: 2.1 },
    { name: 'Za Stodołą', crop: 'Kukurydza', area: 8.5 },
    { name: 'Łąka', crop: 'Trawa', area: 1.2 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* 1. CZARNY PASEK POGODY (GÓRA) */}
      <div className="bg-slate-900 text-white p-2 px-6 flex justify-between items-center text-[10px] font-bold tracking-widest uppercase">
        <div className="flex gap-6 items-center">
          <span className="text-slate-500">POGODA (LOKALNA)</span>
          <span className="flex items-center gap-1"><Thermometer className="w-3 h-3 text-red-400"/> 18°C</span>
          <span className="flex items-center gap-1"><Wind className="w-3 h-3 text-blue-400"/> 2 m/s</span>
          <span className="flex items-center gap-1"><Droplets className="w-3 h-3 text-blue-300"/> 65%</span>
        </div>
        <div className="bg-green-600 px-3 py-1 rounded-full flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          OKNO POGODOWE OTWARTE
        </div>
      </div>

      {/* 2. LOGO I STATYSTYKI (ŚRODEK) */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Sprout className="w-8 h-8 text-green-600" />
          <span className="text-2xl font-black text-slate-800 tracking-tight">
            agrotechniczne<span className="text-green-600">.pl</span>
          </span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex gap-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span className="flex items-center gap-1"><FlaskConical className="w-4 h-4 text-blue-500"/> Magazyn: 4 środki</span>
            <span className="flex items-center gap-1"><LayoutGrid className="w-4 h-4 text-green-500"/> Pola: 4</span>
          </div>
          {/* PRZYCISK WYLOGOWANIA W STYLU SYSTEMU */}
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-2 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 px-3 py-1.5 rounded-lg text-[11px] font-black transition-all border border-slate-200"
          >
            <LogOut className="w-3 h-3" /> WYLOGUJ
          </button>
        </div>
      </div>

      {/* 3. POZIOMA NAWIGACJA (ZAKŁADKI) */}
      <div className="bg-white border-b border-slate-200 px-6">
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
                activeTab === item.id 
                  ? "border-green-600 text-green-700" 
                  : "border-transparent text-slate-400 hover:text-slate-600"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* 4. TREŚĆ GŁÓWNA - WIDOK ZE ZRZUTU */}
      <main className="p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
        {activeTab === 'treatment' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm font-bold text-slate-800 flex items-center gap-3">
              <LayoutGrid className="text-green-600 w-5 h-5"/> 1. Wybierz Pola (Multi-Select)
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map((f, i) => (
                <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-green-300 transition-all cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-black text-slate-800">{f.name}</h3>
                      <p className="text-xs text-slate-400 font-bold uppercase mt-1">{f.crop}</p>
                    </div>
                    <div className="bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 text-xs font-black text-slate-700">
                      {f.area} ha
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-green-50/50 p-4 rounded-xl border border-green-100 flex justify-between items-center text-xs font-black uppercase tracking-widest">
              <span className="text-green-700">Wybrano: 0</span>
              <span className="text-green-800 text-xl">0.00 ha</span>
            </div>
            
            {/* Reszta formularza zgodna ze zrzutem... */}
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-4">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">WARUNKI I DATA</p>
               <input type="text" value="18.01.2026" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xl font-black" readOnly />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};