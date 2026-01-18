# 1. Baza: Instalacja zależności
FROM node:18-alpine AS deps
WORKDIR /app

# Kopiujemy pliki definicji pakietów (package-lock.json jest opcjonalny dzięki *)
COPY package.json package-lock.json* ./

# ZMIANA: Używamy 'npm install' zamiast 'npm ci', żeby nie wywalało błędu przy braku lockfile'a
RUN npm install

# 2. Budowanie aplikacji
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
# Kopiujemy resztę kodu źródłowego
COPY . .

# Generowanie klienta bazy danych
RUN npx prisma generate

# Wyłączenie telemetrii
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

# Kopiowanie plików publicznych i zbudowanej aplikacji
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000
# Ważne: nasłuchiwanie na wszystkich interfejsach
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]