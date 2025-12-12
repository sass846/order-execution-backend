# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

RUN npm prune --production

FROM node:20-alpine

WORKDIR /usr/src/app

RUN apk add --no-cache openssl

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/test.html ./test.html

EXPOSE 3000

CMD ["npm", "start"]
