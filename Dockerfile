# 1. Baza: Instalacja zależności
FROM node:18-alpine AS deps
WORKDIR /app

# WAŻNA POPRAWKA: Instalacja narzędzi do kompilacji (dla bcrypt/prisma na Alpine)
RUN apk add --no-cache libc6-compat python3 make g++

# Kopiujemy pliki
COPY package.json package-lock.json* ./

# Instalujemy zależności (teraz zadziała, bo mamy kompilatory)
RUN npm install

# 2. Budowanie aplikacji
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generowanie klienta bazy danych
RUN npx prisma generate

ENV NEXT_TELEMETRY_DISABLED 1

# Budowanie
RUN npm run build

# 3. Obraz Produkcyjny
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]