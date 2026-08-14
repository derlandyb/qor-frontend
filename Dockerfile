FROM node:22.22.2-bookworm

RUN corepack enable && corepack prepare pnpm@10.13.1 --activate

WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile || pnpm install
RUN pnpm exec playwright install --with-deps chromium

COPY . .

EXPOSE 5173
CMD ["pnpm", "dev", "--host"]
