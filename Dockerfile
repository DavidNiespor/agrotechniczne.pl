# ETAP 1: Instalacja zależności
FROM node:18-slim AS deps
WORKDIR /app

# Instalacja OpenSSL (Dla Prismy)
RUN apt-get update -y && apt-get install -y openssl

# Kopiowanie plików pakietów
COPY package.json ./

# Instalacja (ignorujemy konflikty)
RUN npm install --legacy-peer-deps

# ETAP 2: Budowanie
FROM node:18-slim AS builder
WORKDIR /app

# Kopiujemy node_modules z etapu 1
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generowanie klienta bazy danych
RUN npx prisma generate

ENV NEXT_TELEMETRY_DISABLED 1

# Budowanie aplikacji
RUN npm run build

# ETAP 3: Uruchamianie (Runner)
FROM node:18-slim AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Kopiowanie plików publicznych i aplikacji
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]