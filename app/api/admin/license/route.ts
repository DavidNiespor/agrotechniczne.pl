
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    
    // @ts-ignore
    if (!session || session.user?.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { userId, action } = await req.json();

    if (action === 'EXTEND') {
        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);

        await prisma.user.update({
            where: { id: userId },
            data: {
                licenseStatus: 'ACTIVE',
                licenseExpiresAt: nextYear
            }
        });
    }

    if (action === 'BLOCK') {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        const newStatus = user?.licenseStatus === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED';
        
        await prisma.user.update({
            where: { id: userId },
            data: { licenseStatus: newStatus }
        });
    }

    return NextResponse.json({ success: true });
}
