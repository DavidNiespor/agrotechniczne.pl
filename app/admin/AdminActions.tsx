
'use client';

import React, { useState } from 'react';
import { Calendar, Ban, CheckCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
    userId: string;
    currentStatus: string;
}

export const AdminActions: React.FC<Props> = ({ userId, currentStatus }) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleAction = async (action: 'EXTEND' | 'BLOCK') => {
        if(!confirm(action === 'EXTEND' ? 'Przedłużyć licencję o rok?' : 'Zablokować/Odblokować konto?')) return;
        
        setLoading(true);
        try {
            await fetch('/api/admin/license', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, action })
            });
            router.refresh();
        } catch (e) {
            alert('Błąd operacji');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-end"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>;

    return (
        <div className="flex items-center justify-end gap-2">
            <button 
                onClick={() => handleAction('EXTEND')}
                className="p-2 bg-green-50 text-green-700 hover:bg-green-100 rounded border border-green-200 transition-colors"
                title="Przedłuż licencję (+1 rok)"
            >
                <Calendar className="w-4 h-4" />
            </button>
            
            {currentStatus === 'BLOCKED' ? (
                 <button 
                    onClick={() => handleAction('BLOCK')}
                    className="p-2 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded border border-slate-200 transition-colors"
                    title="Odblokuj"
                 >
                    <CheckCircle className="w-4 h-4" />
                 </button>
            ) : (
                <button 
                    onClick={() => handleAction('BLOCK')}
                    className="p-2 bg-red-50 text-red-700 hover:bg-red-100 rounded border border-red-200 transition-colors"
                    title="Zablokuj dostęp"
                >
                    <Ban className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};
