# 1. Baza: Node na Debianie (OpenSSL 3.0)
FROM node:18-slim AS base

# 2. Instalacja zależności
FROM base AS deps
WORKDIR /app

# Instalujemy OpenSSL (wymagane przez Prisma)
RUN apt-get update -y && apt-get install -y openssl

# Kopiujemy pliki konfiguracyjne pakietów
COPY package.json ./

# Instalacja zależności
RUN npm install --legacy-peer-deps

# 3. Budowanie (Builder)
FROM base AS builder
WORKDIR /app

# Kopiujemy node_modules z etapu deps
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generowanie klienta Prismy
RUN npx prisma generate

ENV NEXT_TELEMETRY_DISABLED 1

# --- KLUCZOWE: Budowanie aplikacji (To tworzy folder standalone) ---
RUN npm run build
# -------------------------------------------------------------------

# 4. Uruchamianie (Runner)
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Instalacja OpenSSL i globalnej Prismy (do komendy db push)
RUN apt-get update -y && apt-get install -y openssl
RUN npm install -g prisma

# Tworzenie użytkownika systemowego
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# --- KOPIOWANIE PLIKÓW ---

# Folder public (zakomentowany, żeby nie wywalał błędu, jeśli go nie masz)
# Jeśli dodasz pliki do folderu public, odkomentuj tę linię:
# COPY --from=builder /app/public ./public

# Folder standalone (Silnik aplikacji - to tu był błąd wcześniej)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Pliki statyczne (CSS, JS)
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Schemat bazy danych (potrzebny do automatycznej migracji)
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Ustawienie uprawnień
USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# --- AUTOMATYCZNY START ---
# 1. prisma db push (Tworzy/aktualizuje tabele w bazie)
# 2. node server.js (Uruchamia stronę)
CMD ["/bin/sh", "-c", "prisma db push && node server.js"]