
'use client';

import React, { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sprout, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const registered = searchParams.get('registered');

  // Auto-redirect if already logged in
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
       // @ts-ignore
       if (session.user.role === 'ADMIN') {
         router.push('/admin');
       } else {
         router.push('/'); // Dashboard
       }
    }
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError("Nieprawidłowy email lub hasło. Sprawdź też czy konto nie jest zablokowane.");
      setLoading(false);
    } else {
      // Successful login - useEffect handles redirect
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        
        <div className="bg-slate-900 p-8 text-center">
           <div className="mx-auto w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-green-900/50">
              <Sprout className="text-white w-7 h-7" />
           </div>
           <h2 className="text-2xl font-bold text-white">Witaj ponownie</h2>
           <p className="text-slate-400 text-sm mt-1">Zaloguj się do swojego gospodarstwa</p>
        </div>

        <div className="p-8">
          {registered && (
            <div className="mb-6 p-3 bg-green-50 text-green-700 text-sm rounded border border-green-200 flex items-center gap-2">
              <Sprout className="w-4 h-4"/> Konto utworzone! Możesz się zalogować.
            </div>
          )}

          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-700 text-sm rounded border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4"/> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input name="email" type="email" required className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all" placeholder="jan@example.com" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hasło</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input name="password" type="password" required className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all" placeholder="••••••••" />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Logowanie...' : 'Zaloguj się'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
             <p className="text-sm text-slate-500">
               Nie masz konta? <Link href="/register" className="text-green-600 font-bold hover:underline">Zarejestruj gospodarstwo</Link>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
