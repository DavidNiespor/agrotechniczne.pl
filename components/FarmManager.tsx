// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { signOut } from "next-auth/react";
import { 
  Sprout, Tractor, FlaskConical, FileText, LayoutGrid, Droplets, 
  Thermometer, Wind, LogOut 
} from 'lucide-react';
import { cn } from "@/lib/utils";

export const FarmManager = ({ session }) => {
  const [activeTab, setActiveTab] = useState('treatment');

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* CZARNY PASEK POGODY - GÓRA */}
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
            OKNO POGODOWE OTWARTE
          </div>
          {/* GUZIK WYLOGUJ - Dyskretnie na czarnym tle */}
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="hover:text-red-400 transition-colors flex items-center gap-1 border-l border-slate-700 pl-4 ml-2"
          >
            <LogOut className="w-3 h-3" /> WYLOGUJ
          </button>
        </div>
      </div>

      {/* LOGO I STATYSTYKI */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Sprout className="w-8 h-8 text-green-600" />
          <span className="text-2xl font-black text-slate-800 tracking-tight">
            agrotechniczne<span className="text-green-600">.pl</span>
          </span>
        </div>
        <div className="flex gap-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          <span className="flex items-center gap-1"><FlaskConical className="w-4 h-4 text-blue-500"/> Magazyn: 4</span>
          <span className="flex items-center gap-1"><LayoutGrid className="w-4 h-4 text-green-500"/> Pola: 4</span>
        </div>
      </div>

      {/* POZIOMA NAWIGACJA ZAKŁADEK */}
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

      {/* TREŚĆ GŁÓWNA */}
      <main className="p-8 max-w-6xl mx-auto">
        <div className="animate-in fade-in duration-500">
           {/* TWOJE ORYGINALNE KAFELKI PÓL DO WYBORU */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Działka pod Lasem', area: '5.4 ha', crop: 'Pszenica ozima' },
                { name: 'Klin', area: '2.1 ha', crop: 'Rzepak' },
                { name: 'Za Stodołą', area: '8.5 ha', crop: 'Kukurydza' },
                { name: 'Łąka', area: '1.2 ha', crop: 'Trawa' }
              ].map((f, i) => (
                <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-green-500 transition-all cursor-pointer">
                   <h3 className="font-black text-slate-800 uppercase text-sm tracking-tight">{f.name}</h3>
                   <p className="text-xs text-slate-500 font-bold">{f.area} • {f.crop}</p>
                </div>
              ))}
           </div>
        </div>
      </main>
    </div>
  );
};