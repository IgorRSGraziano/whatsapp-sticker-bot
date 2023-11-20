FROM node:21-alpine3.17 AS base
WORKDIR /app
RUN apk add chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

FROM base AS dependencies
COPY package*.json ./
#CI not run post-install scripts (needed from puppeteer and sharp)
RUN npm i --unsafe-perm=true --allow-root

FROM base AS build
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
ENV NODE_ENV=production
RUN npm run build
# RUN npm prune --production

FROM base AS release
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]