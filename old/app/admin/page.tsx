
import React from 'react';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { ShieldCheck, Calendar, Ban, CheckCircle, Search } from 'lucide-react';
import { AdminActions } from './AdminActions'; // Client component for buttons

const prisma = new PrismaClient();

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  // Security Check: Only Admin
  // @ts-ignore
  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/');
  }

  // Fetch all users
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
        id: true,
        email: true,
        fullName: true,
        farmName: true,
        role: true,
        licenseStatus: true,
        licenseExpiresAt: true,
        createdAt: true,
        _count: {
            select: { fields: true }
        }
    }
  });

  return (
    <div className="min-h-screen bg-slate-100 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
                <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg">
                    <ShieldCheck className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Panel Administratora</h1>
                    <p className="text-slate-500">Zarządzanie licencjami i dostępem do platformy</p>
                </div>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 text-sm">
                Zalogowany jako: <span className="font-bold text-slate-900">{session.user?.email}</span>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard label="Wszystkich kont" value={users.length} />
            <StatCard label="Licencje Aktywne" value={users.filter(u => u.licenseStatus === 'ACTIVE').length} color="text-green-600" />
            <StatCard label="Wersje Trial" value={users.filter(u => u.licenseStatus === 'TRIAL').length} color="text-blue-600" />
            <StatCard label="Zablokowane" value={users.filter(u => u.licenseStatus === 'BLOCKED').length} color="text-red-600" />
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-lg text-slate-700">Lista Gospodarstw</h3>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input placeholder="Szukaj (Email/Nazwa)..." className="pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-slate-400 outline-none w-64" />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-200">
                        <tr>
                            <th className="p-5">Gospodarstwo / Email</th>
                            <th className="p-5">Rola</th>
                            <th className="p-5">Status Licencji</th>
                            <th className="p-5">Wygasa</th>
                            <th className="p-5 text-center">Pola (szt.)</th>
                            <th className="p-5 text-right">Akcje</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-5">
                                    <div className="font-bold text-slate-800 text-base">{user.farmName || user.fullName}</div>
                                    <div className="text-slate-500 text-xs">{user.email}</div>
                                    <div className="text-slate-400 text-[10px] mt-1">ID: {user.id}</div>
                                </td>
                                <td className="p-5">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="p-5">
                                    <StatusBadge status={user.licenseStatus} />
                                </td>
                                <td className="p-5 font-mono text-slate-600">
                                    {user.licenseExpiresAt ? new Date(user.licenseExpiresAt).toLocaleDateString('pl-PL') : '-'}
                                </td>
                                <td className="p-5 text-center font-bold text-slate-700">
                                    {user._count.fields}
                                </td>
                                <td className="p-5 text-right">
                                    <AdminActions userId={user.id} currentStatus={user.licenseStatus} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

      </div>
    </div>
  );
}

const StatCard = ({ label, value, color = "text-slate-800" }: any) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="text-slate-500 text-sm font-medium uppercase tracking-wider">{label}</div>
        <div className={`text-3xl font-black mt-2 ${color}`}>{value}</div>
    </div>
);

const StatusBadge = ({ status }: { status: string }) => {
    const styles: any = {
        'ACTIVE': 'bg-green-100 text-green-700 border-green-200',
        'TRIAL': 'bg-blue-100 text-blue-700 border-blue-200',
        'EXPIRED': 'bg-amber-100 text-amber-700 border-amber-200',
        'BLOCKED': 'bg-red-100 text-red-700 border-red-200',
    };
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status] || 'bg-gray-100'}`}>
            {status}
        </span>
    );
};
