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
  // TWOJE ORYGINALNE ZAKŁADKI
  const [activeTab, setActiveTab] = useState('treatment');

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* 1. CZARNY PASEK POGODY - DODAŁEM TYLKO GUZIK WYLOGUJ PO PRAWEJ */}
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
            SYSTEM AKTYWNY
          </div>
          {/* PRZYCISK WYLOGUJ - NIE ZMIENIA UKŁADU RESZTY STRONY */}
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="hover:text-red-400 transition-colors flex items-center gap-1 border-l border-slate-700 pl-4 ml-2"
          >
            <LogOut className="w-3 h-3" /> WYLOGUJ
          </button>
        </div>
      </div>

      {/* 2. TWOJE ORYGINALNE LOGO I STATYSTYKI */}
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

      {/* 3. TWOJA ORYGINALNA NAWIGACJA POZIOMA */}
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

      {/* 4. TWOJA TREŚĆ GŁÓWNA */}
      <main className="p-8 max-w-6xl mx-auto">
        {activeTab === 'treatment' && (
          <div className="animate-in fade-in duration-500">
             {/* Tu Twój oryginalny kod formularza zabiegów */}
             <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center py-20">
               <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                 Wybierz pola powyżej, aby rozpocząć rejestrację zabiegu
               </p>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};