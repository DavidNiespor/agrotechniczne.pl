# 1. Baza: Używamy Debian Slim
FROM node:18-slim AS base

# 2. Instalacja zależności
FROM base AS deps
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl
COPY package.json ./
RUN npm install --legacy-peer-deps

# 3. Budowanie
FROM base AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules

# Generowanie klienta
RUN npx prisma generate

ENV NEXT_TELEMETRY_DISABLED 1

# Budowanie aplikacji
#RUN npm run build

# 4. Uruchamianie (PRODUKCJA)
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Instalujemy OpenSSL ORAZ globalnie Prismę (żeby móc robić db push)
RUN apt-get update -y && apt-get install -y openssl
RUN npm install -g prisma

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Kopiujemy pliki aplikacji
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# --- KLUCZOWE: Kopiujemy schemat bazy, żeby automat miał na czym pracować ---
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# (Opcjonalnie: Jeśli nie masz folderu public, zostaw to zakomentowane)
# COPY --from=builder /app/public ./public

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# --- AUTOMATYCZNY START ---
# 1. Wypychamy zmiany do bazy (db push)
# 2. Startujemy serwer (node server.js)
CMD ["node", "server.js"]