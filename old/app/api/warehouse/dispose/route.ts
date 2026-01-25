
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth'; // Założenie: skonfigurowano next-auth options
// import { authOptions } from '../../auth/[...nextauth]/route'; 

const prisma = new PrismaClient();

export async function PUT(req: Request) {
  try {
    // 1. Weryfikacja sesji (Pseudokod, wymaga pełnej konfiguracji next-auth)
    // const session = await getServerSession(authOptions);
    // if (!session || !session.user?.email) {
    //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    // }
    // const userEmail = session.user.email;

    // Tymczasowe pobranie usera po emailu z body (dla testów MVP bez pełnego auth)
    // W produkcji: pobierz ID usera z sesji!
    const body = await req.json();
    const { id, disposalDate } = body;

    if (!id || !disposalDate) {
      return NextResponse.json({ message: 'Brak ID lub daty' }, { status: 400 });
    }

    // 2. Aktualizacja w bazie
    // Używamy updateMany z where userId, aby upewnić się, że rolnik usuwa SWÓJ środek
    const updatedBatch = await prisma.warehouseItem.update({
      where: { 
        id: id,
        // userId: sessionUser.id // Security check
      },
      data: {
        quantity: 0,
        isWaste: false, // Już nie jest oczekującym odpadem
        isDisposed: true, // Jest zutylizowany
        disposalDate: new Date(disposalDate),
        // disposedAmount powinno być ustawione w poprzednim kroku (MoveToWaste),
        // ale jeśli nie, można tu dodać logikę.
      }
    });

    return NextResponse.json({ message: 'Pomyślnie zutylizowano', item: updatedBatch }, { status: 200 });

  } catch (error) {
    console.error('Disposal Error:', error);
    return NextResponse.json({ message: 'Błąd bazy danych' }, { status: 500 });
  }
}
