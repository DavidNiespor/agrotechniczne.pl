# 1. Baza: Używamy Debian Slim zamiast Alpine (lepsza kompatybilność)
FROM node:18-slim AS base

# 2. Instalacja zależności
FROM base AS deps
WORKDIR /app

# Instalujemy OpenSSL (wymagane przez Prisma) w środowisku Debian
RUN apt-get update -y && apt-get install -y openssl

# Kopiujemy tylko plik z zależnościami
COPY package.json ./

# Instalacja z flagą legacy-peer-deps (ignoruje konflikty wersji)
# Debian (slim) ma lepszą obsługę prekompilowanych paczek, więc tu rzadziej wywala błąd
RUN npm install --legacy-peer-deps

# 3. Budowanie
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generowanie klienta bazy danych
# Jeśli nie masz folderu prisma, ta linia może wyrzucić błąd - wtedy ją usuń
RUN npx prisma generate

ENV NEXT_TELEMETRY_DISABLED 1

# Budowanie aplikacji
RUN npm run build

# 4. Uruchamianie
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Dodajemy użytkownika (w Debianie robi się to minimalnie inaczej)
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