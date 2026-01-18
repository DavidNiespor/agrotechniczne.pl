# ETAP 1: Instalacja
FROM node:18-slim AS deps
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl
COPY package.json ./
RUN npm install --legacy-peer-deps

# ETAP 2: Budowanie (TUTAJ ZMIANA)
FROM node:18-slim AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules

RUN npx prisma generate

# --- DEBUG MODE: Wyłączamy build, żeby kontener wstał ---
# RUN npm run build
# --------------------------------------------------------

# ETAP 3: Uruchamianie
FROM node:18-slim AS runner
WORKDIR /app
ENV NODE_ENV production

# Kopiujemy wszystko jak leci (tymczasowo)
COPY --from=builder /app ./

EXPOSE 3000
# Komenda, która utrzymuje kontener przy życiu bez uruchamiania aplikacji
CMD ["tail", "-f", "/dev/null"]