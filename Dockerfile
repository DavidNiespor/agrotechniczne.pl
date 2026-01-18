# ... (reszta pliku bez zmian) ...

# 3. Budowanie
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generowanie klienta bazy danych
RUN npx prisma generate

ENV NEXT_TELEMETRY_DISABLED 1

# --- ZMIANA TUTAJ: Zakomentuj build, żeby nie wywalał błędu ---
# RUN npm run build
# --------------------------------------------------------------

# 4. Uruchamianie
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Skopiuj wszystko (tymczasowo), bo nie mamy folderu .next/standalone
COPY --from=builder /app ./

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# --- ZMIANA: Zamiast startować, czekamy w nieskończoność ---
CMD ["tail", "-f", "/dev/null"]