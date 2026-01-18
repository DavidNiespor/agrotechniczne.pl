# 1. Baza: Używamy Debian Slim zamiast Alpine
FROM node:18-slim AS base

# 2. Instalacja zależności
FROM base AS deps
WORKDIR /app

# Instalujemy OpenSSL (wymagane przez Prisma)
RUN apt-get update -y && apt-get install -y openssl

# Kopiujemy pakiet
COPY package.json ./

# Instalacja (ignorujemy konflikty wersji)
RUN npm install --legacy-peer-deps

# 3. Budowanie
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generowanie klienta bazy danych
RUN npx prisma generate

ENV NEXT_TELEMETRY_DISABLED 1

# Budowanie aplikacji
RUN npm run build

# 4. Uruchamianie
FROM base AS runner
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