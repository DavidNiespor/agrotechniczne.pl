# ETAP 1: Instalacja zależności
FROM node:18-alpine AS deps
WORKDIR /app

# 1. Instalacja narzędzi systemowych (OpenSSL jest kluczowy dla Prismy!)
RUN apk update && apk add --no-cache \
    libc6-compat \
    python3 \
    make \
    g++ \
    openssl \
    openssl-dev

# 2. Kopiujemy TYLKO package.json (Ignorujemy package-lock.json z Windowsa)
COPY package.json ./

# 3. Instalacja z flagą --legacy-peer-deps (Ignoruje konflikty wersji)
# To zazwyczaj naprawia błąd "exit code: 1"
RUN npm install --legacy-peer-deps

# ETAP 2: Budowanie
FROM node:18-alpine AS builder
WORKDIR /app

# Kopiujemy node_modules z poprzedniego etapu
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 4. Generowanie klienta bazy (z wymuszeniem OpenSSL)
RUN npx prisma generate

ENV NEXT_TELEMETRY_DISABLED 1

# 5. Budowanie aplikacji
RUN npm run build

# ETAP 3: Uruchamianie
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Dodajemy usera
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Kopiujemy pliki publiczne
COPY --from=builder /app/public ./public

# Kopiujemy aplikację
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]