# Use official Node.js runtime as base image
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build-time environment variables
ENV NEXT_PUBLIC_SEQ1_API_URL=https://api.seq1.net
ENV SEQ1_API_URL=https://api.seq1.net
ENV NEXT_PUBLIC_APP_URL=https://seq1.net
ENV NEXT_PUBLIC_BITCOIN_BLOCKHEIGHT=899250
ENV NODE_ENV=production

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 8080

# Set runtime environment variables
ENV NEXT_PUBLIC_SEQ1_API_URL=https://api.seq1.net
ENV SEQ1_API_URL=https://api.seq1.net
ENV NEXT_PUBLIC_APP_URL=https://seq1.net
ENV NEXT_PUBLIC_BITCOIN_BLOCKHEIGHT=899250

CMD ["node", "server.js"] 