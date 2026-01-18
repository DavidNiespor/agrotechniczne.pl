# 1. Baza
FROM node:18-slim AS deps
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl
COPY package.json ./
RUN npm install --legacy-peer-deps

# 2. Budowanie
FROM node:18-slim AS builder
WORKDIR /app

# Najpierw kod, potem moduły (ważna kolejność!)
COPY . .
COPY --from=deps /app/node_modules ./node_modules

# Generowanie klienta bazy
RUN npx prisma generate

ENV NEXT_TELEMETRY_DISABLED 1

# --- PRZYWRACAMY BUDOWANIE (Bo naprawiłeś kod!) ---
RUN npm run build
# --------------------------------------------------

# 3. Uruchamianie
FROM node:18-slim AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Kopiowanie plików wynikowych
#COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# --- PRZYWRACAMY START SERWERA ---
CMD ["node", "server.js"]