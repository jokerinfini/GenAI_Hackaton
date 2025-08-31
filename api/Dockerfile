FROM node:20-alpine
WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN if [ -f pnpm-lock.yaml ]; then corepack enable && corepack prepare pnpm@latest --activate && pnpm i --frozen-lockfile;     elif [ -f yarn.lock ]; then yarn install --frozen-lockfile;     elif [ -f package-lock.json ]; then npm ci;     else npm i; fi
COPY . .
RUN npm run build || true

# Make startup scripts executable
COPY start.sh start-prod.sh ./
RUN chmod +x start.sh start-prod.sh

EXPOSE 3001
CMD ["./start.sh"]
