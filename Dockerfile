# 1. Baza: Instalacja zależności
FROM node:18-alpine AS deps
WORKDIR /app

# WAŻNA POPRAWKA: Instalacja narzędzi do kompilacji (dla bcrypt/prisma na Alpine)
# Bez tego npm install zawsze wyrzuci błąd przy bibliotekach C++
RUN apk add --no-cache libc6-compat python3 make g++

# Kopiujemy pliki definicji pakietów
COPY package.json package-lock.json* ./

# Instalujemy zależności
RUN npm install

# 2. Budowanie aplikacji
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
# Kopiujemy resztę kodu źródłowego
COPY . .

# Generowanie klienta bazy danych (Prisma)
RUN npx prisma generate

# Wyłączenie telemetrii Next.js
ENV NEXT_TELEMETRY_DISABLED 1

# Budowanie aplikacji
RUN npm run build

# 3. Obraz Produkcyjny (Uruchamianie)
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Kopiowanie plików publicznych
COPY --from=builder /app/public ./public

# Kopiowanie zbudowanej aplikacji (Standalone)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Przełączenie na bezpiecznego użytkownika
USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]