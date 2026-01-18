import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Rozpoczynam seedowanie bazy agrotechniczne.pl...');

  // 1. Hashowanie haseł
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('rolnik123', 10);

  // 2. Tworzenie Admina (Właściciel platformy)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@agrotechniczne.pl' },
    update: {},
    create: {
      email: 'admin@agrotechniczne.pl',
      passwordHash: adminPassword,
      fullName: 'Główny Administrator',
      role: 'ADMIN',
      licenseStatus: 'ACTIVE',
      // Licencja ważna 99 lat
      licenseExpiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 99)),
    },
  });
  console.log(`✅ Admin utworzony: ${admin.email}`);

  // 3. Tworzenie Rolnika Demo z danymi gospodarstwa
  const farmer = await prisma.user.upsert({
    where: { email: 'rolnik@demo.pl' },
    update: {},
    create: {
      email: 'rolnik@demo.pl',
      passwordHash: userPassword,
      fullName: 'Jan Kowalski',
      farmName: 'Gospodarstwo Rolne "Kłos"',
      farmAddress: 'ul. Polna 5, 05-600 Grójec',
      piorinNumber: 'PL-060612345', // Ważne dla raportów
      role: 'USER',
      licenseStatus: 'ACTIVE',
      licenseExpiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      chemAuthDate: new Date('2025-05-15'), // Ważne uprawnienia

      // --- DODAWANIE PÓL ---
      fields: {
        create: [
          {
            name: 'Działka pod Lasem',
            parcelNumber: '142/5',
            area: 5.40,
            areaCrop: 5.40,
            currentCrop: 'Pszenica ozima'
          },
          {
            name: 'Klin przy drodze',
            parcelNumber: '188/2',
            area: 2.15,
            areaCrop: 2.15,
            currentCrop: 'Rzepak'
          }
        ]
      },

      // --- DODAWANIE MASZYN ---
      machines: {
        create: [
          {
            name: 'Pilmet 2500',
            tankCapacity: 2500,
            inspectionDate: new Date('2024-12-01')
          }
        ]
      },

      // --- DODAWANIE MAGAZYNU ŚRODKÓW ---
      warehouse: {
        create: [
          {
            name: 'Mospilan 20 SP',
            type: 'Insektycyd',
            activeSubstance: 'Acetamipryd',
            activeContent: '20%',
            batchNumber: 'BATCH-2023-WIO',
            productionDate: new Date('2023-03-10'),
            expiryDate: new Date('2025-03-10'),
            quantity: 3.5,
            unit: 'kg'
          },
          {
            name: 'Tebu 250 EW',
            type: 'Fungicyd',
            activeSubstance: 'Tebukonazol',
            activeContent: '250 g/l',
            batchNumber: 'TEBU-001-A',
            productionDate: new Date('2023-09-01'),
            expiryDate: new Date('2025-09-01'),
            quantity: 15.0,
            unit: 'l'
          },
          {
            // Przykład środka do utylizacji (przeterminowany)
            name: 'Roundup Flex',
            type: 'Herbicyd',
            activeSubstance: 'Glifosat',
            batchNumber: 'OLD-BATCH-99',
            productionDate: new Date('2019-01-01'),
            expiryDate: new Date('2021-01-01'),
            quantity: 0.5,
            unit: 'l',
            isWaste: true, // Oznaczony jako odpad
            disposalDate: null // Jeszcze nie oddany
          }
        ]
      }
    },
  });
  console.log(`✅ Rolnik demo utworzony: ${farmer.email} (Farma: ${farmer.farmName})`);
  console.log('🚀 Seedowanie zakończone pomyślnie.');
}

main()
  .catch((e) => {
    console.error(e);
    (process as any).exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });