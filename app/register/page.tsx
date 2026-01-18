
'use client';

import React, { useState } from 'react';
import { Sprout, Tractor, User, MapPin, FileText, Lock, Mail, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    if (data.password !== data.confirmPassword) {
        setError("Hasła nie są identyczne");
        setLoading(false);
        return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Błąd rejestracji');
      }

      router.push('/login?registered=true');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-5xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Lewa kolumna - Branding */}
        <div className="bg-gradient-to-br from-green-700 to-emerald-900 text-white p-10 flex flex-col justify-between md:w-2/5 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-8">
              <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                 <Sprout className="w-8 h-8 text-green-300" />
              </div>
              <span className="text-2xl font-bold tracking-tight">agrotechniczne.pl</span>
            </div>
            <h2 className="text-4xl font-bold mb-6 leading-tight">Twój cyfrowy<br/>zeszyt pola.</h2>
            <ul className="space-y-4 text-green-100 opacity-90 font-medium">
               <li className="flex gap-3 items-center"><Tractor className="w-5 h-5 text-green-300"/> Ewidencja maszyn i przeglądów</li>
               <li className="flex gap-3 items-center"><FileText className="w-5 h-5 text-green-300"/> Raporty zgodne z PIORiN</li>
               <li className="flex gap-3 items-center"><User className="w-5 h-5 text-green-300"/> Zarządzanie uprawnieniami</li>
            </ul>
          </div>
          <div className="mt-12 text-xs text-green-200/60">
             © 2024 Agrotechniczne.pl
          </div>
          {/* Decorative Circle */}
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-green-500 rounded-full opacity-20 blur-3xl"></div>
        </div>

        {/* Prawa kolumna - Formularz */}
        <div className="p-8 md:p-12 md:w-3/5 overflow-y-auto max-h-[90vh]">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-slate-900">Załóż Gospodarstwo</h3>
            <p className="text-slate-500 mt-1">Rozpocznij 14-dniowy okres próbny. Bez karty płatniczej.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 flex items-center gap-2">
              <span className="font-bold">Błąd:</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputGroup icon={User} label="Imię i Nazwisko" name="fullName" placeholder="Jan Kowalski" required />
              <InputGroup icon={Tractor} label="Nazwa Gospodarstwa" name="farmName" placeholder="Gosp. Rolne" required />
            </div>

            <InputGroup icon={MapPin} label="Adres Gospodarstwa" name="farmAddress" placeholder="Wiejska 1, 00-001 Rolniczowo" />
            
            <div>
               <InputGroup icon={FileText} label="Nr Ewidencji Producenta (PIORiN)" name="piorinNumber" placeholder="PL-XXXXXXXXX" required />
               <p className="text-[10px] text-slate-400 mt-1.5 ml-1">Numer niezbędny do generowania ważnych prawnie raportów.</p>
            </div>

            <div className="border-t border-slate-100 my-2 pt-2"></div>

            <InputGroup icon={Mail} label="Adres E-mail" name="email" type="email" placeholder="jan@example.com" required />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputGroup icon={Lock} label="Hasło" name="password" type="password" placeholder="••••••••" required />
              <InputGroup icon={Lock} label="Powtórz Hasło" name="confirmPassword" type="password" placeholder="••••••••" required />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-xl transition-all mt-6 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {loading ? 'Tworzenie konta...' : 'Zarejestruj się za darmo'}
            </button>
          </form>
          
          <p className="mt-8 text-center text-sm text-slate-500">
            Posiadasz już konto? <Link href="/login" className="text-green-700 font-bold hover:underline">Zaloguj się</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const InputGroup = ({ label, icon: Icon, ...props }: any) => (
  <div>
    <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block tracking-wide">{label}</label>
    <div className="relative group">
      <Icon className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-green-600 transition-colors" />
      <input className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all placeholder:text-slate-300" {...props} />
    </div>
  </div>
);
