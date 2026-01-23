// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { signOut } from "next-auth/react";
import { Sprout, Plus, X, Droplets, Wind, Thermometer, LayoutGrid, LogOut } from 'lucide-react';
import { cn } from "@/lib/utils";

export const FarmManager = ({ initialFields = [] }) => {
  const [activeTab, setActiveTab] = useState('fields');
  const [fields, setFields] = useState(initialFields);
  const [modalOpen, setModalOpen] = useState(false);

  const handleSaveField = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const itemData = {
      name: formData.get('name'),
      area: formData.get('area'),
      crop: formData.get('crop'),
      parcel: formData.get('parcel')
    };

    const res = await fetch('/api/fields', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData),
    });

    if (res.ok) {
      const saved = await res.json();
      // Mapujemy cropType z bazy na Twoje pole crop w UI
      setFields([...fields, { ...saved, crop: saved.cropType }]);
      setModalOpen(false);
    }
  };

  return (
    <div className="agrotechniczne-bg">
      {/* 1. CZARNY PASEK POGODY */}
      <div className="agrotechniczne-black-bar">
        <div className="flex gap-6 items-center">
          <span className="text-slate-500 font-black italic tracking-tighter">agrotechniczne.pl</span>
          <span className="flex items-center gap-1"><Thermometer className="w-3 h-3 text-red-400"/> 18°C</span>
          <span className="flex items-center gap-1"><Wind className="w-3 h-3 text-blue-400"/> 2 m/s</span>
          <span className="flex items-center gap-1"><Droplets className="w-3 h-3 text-blue-300"/> 65%</span>
        </div>
        <button onClick={() => signOut({ callbackUrl: '/login' })} className="flex items-center gap-2 hover:text-red-400 transition-colors">
          <LogOut className="w-3 h-3" /> <span className="font-black uppercase">WYLOGUJ</span>
        </button>
      </div>

      {/* 2. LOGO I NAWIGACJA */}
      <div className="agrotechniczne-nav">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2 uppercase">
            <Sprout className="w-8 h-8 text-green-600"/> agrotechniczne<span className="text-green-600">.pl</span>
          </h1>
          <nav className="flex gap-4">
            <button onClick={() => setActiveTab('fields')} className={cn("px-4 py-2 text-xs font-black uppercase tracking-widest border-b-2 transition-all", activeTab === 'fields' ? "border-green-600 text-green-700" : "border-transparent text-slate-400")}>
              2. Pola
            </button>
          </nav>
        </div>
      </div>

      {/* 3. TREŚĆ GŁÓWNA */}
      <main className="max-w-7xl mx-auto p-8 animate-in fade-in">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Twoje Pola</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Zarządzanie gruntami</p>
          </div>
          <button onClick={() => setModalOpen(true)} className="agrotechniczne-btn-green">
            <Plus className="w-5 h-5" /> DODAJ POLE
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {fields.map(f => (
            <div key={f.id} className="agrotechniczne-card">
              <div className="text-[10px] font-black text-slate-400 uppercase mb-1">{f.parcelNumber}</div>
              <div className="text-3xl font-black text-slate-800 mb-1">{f.area} ha</div>
              <h3 className="font-bold text-lg text-slate-900">{f.name}</h3>
              <div className="mt-4">
                <span className="agrotechniczne-badge">{f.crop || f.cropType}</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* 4. MODAL (TWÓJ ORYGINALNY DESIGN) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[40px] p-10 w-full max-w-md shadow-2xl relative animate-in zoom-in-95">
            <button onClick={() => setModalOpen(false)} className="absolute top-8 right-8 text-slate-400 hover:bg-slate-50 p-1 rounded-full"><X /></button>
            <h3 className="text-2xl font-black text-slate-800 uppercase mb-8 text-center tracking-tighter">Nowe Pole</h3>
            <form onSubmit={handleSaveField} className="space-y-4">
              <input name="name" placeholder="Nazwa Pola" className="agrotechniczne-input" required />
              <div className="grid grid-cols-2 gap-4">
                <input name="parcel" placeholder="Nr Działki" className="agrotechniczne-input" required />
                <input name="area" type="number" step="0.01" placeholder="Obszar (ha)" className="agrotechniczne-input" required />
              </div>
              <input name="crop" placeholder="Uprawa" className="agrotechniczne-input" required />
              <button type="submit" className="agrotechniczne-btn-black">ZAPISZ POLE W BAZIE</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};