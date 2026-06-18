FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=deps    /app/node_modules  ./node_modules
COPY --from=builder /app/.next         ./.next
COPY --from=builder /app/scripts       ./scripts
COPY --from=builder /app/database      ./database
COPY --from=builder /app/package.json  ./package.json

EXPOSE 3000

CMD ["node_modules/.bin/next", "start", "-H", "0.0.0.0"]
