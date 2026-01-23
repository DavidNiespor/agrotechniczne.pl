// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { signOut } from "next-auth/react";
import { Sprout, Plus, X, Droplets, Wind, Thermometer, LayoutGrid, LogOut } from 'lucide-react';
import { cn } from "@/lib/utils";
import '@/styles/farm.css'; // <--- IMPORT TWOICH STYLI

export const FarmManager = ({ initialFields = [] }) => {
  const [activeTab, setActiveTab] = useState('fields');
  const [fields, setFields] = useState(initialFields);
  const [modalOpen, setModalOpen] = useState(false);

  const handleSaveField = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const itemData = Object.fromEntries(formData);

    const res = await fetch('/api/fields', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });

    if (res.ok) {
      const saved = await res.json();
      setFields([...fields, saved]);
      setModalOpen(false);
    }
  };

  return (
    <div className="farm-container">
      {/* POGODA */}
      <div className="weather-bar">
        <div className="flex gap-6 items-center">
          <span className="text-slate-500 font-black italic">agrotechniczne.pl</span>
          <span className="flex items-center gap-1"><Thermometer className="w-3 h-3 text-red-400"/> 18°C</span>
          <span className="flex items-center gap-1"><Droplets className="w-3 h-3 text-blue-300"/> 65%</span>
        </div>
        <button onClick={() => signOut()} className="flex items-center gap-1 font-black"><LogOut className="w-3 h-3"/> WYLOGUJ</button>
      </div>

      {/* HEADER */}
      <div className="nav-sticky">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2 uppercase">
            <Sprout className="w-8 h-8 text-green-600"/> agrotechniczne.pl
          </h1>
          <button onClick={() => setActiveTab('fields')} className={cn("text-xs font-black uppercase tracking-widest border-b-2 px-4 py-2", activeTab === 'fields' ? "border-green-600 text-green-700" : "border-transparent text-slate-400")}>2. Pola</button>
        </div>
      </div>

      {/* CONTENT */}
      <main className="max-w-7xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black uppercase">Twoje Pola</h2>
          <button onClick={() => setModalOpen(true)} className="btn-primary"><Plus className="w-5 h-5"/> DODAJ POLE</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {fields.map(f => (
            <div key={f.id} className="field-card">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{f.parcelNumber}</div>
              <div className="text-3xl font-black text-slate-800 my-2">{f.area} ha</div>
              <div className="font-bold text-lg">{f.name}</div>
              <div className="mt-4 inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-[10px] font-black uppercase">{f.cropType}</div>
            </div>
          ))}
        </div>
      </main>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[40px] p-10 w-full max-w-md relative shadow-2xl animate-in zoom-in-95">
            <button onClick={() => setModalOpen(false)} className="absolute top-8 right-8 text-slate-400"><X/></button>
            <h3 className="text-2xl font-black uppercase text-center mb-8">Nowe Pole</h3>
            <form onSubmit={handleSaveField} className="space-y-4">
              <input name="name" placeholder="Nazwa Pola" className="input-field" required />
              <div className="grid grid-cols-2 gap-4">
                <input name="parcel" placeholder="Nr Działki" className="input-field" required />
                <input name="area" type="number" step="0.01" placeholder="Obszar ha" className="input-field" required />
              </div>
              <input name="crop" placeholder="Uprawa" className="input-field" required />
              <button type="submit" className="btn-dark">ZAPISZ DANE</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};