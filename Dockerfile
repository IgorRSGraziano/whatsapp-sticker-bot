FROM oven/bun:1-alpine as base
RUN apk add nodejs
WORKDIR /usr/src/app

FROM base AS install

WORKDIR /temp/prod
RUN mkdir -p .
COPY package.json .

RUN bun install

FROM install AS prerelease
# WORKDIR /usr/src/app
COPY --from=install /temp/prod/node_modules node_modules
COPY . .

FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/src src
COPY --from=prerelease /usr/src/app/package.json .
RUN ls /usr/src/app/
RUN ls /usr/src/app/src

ENTRYPOINT [ "bun", "run", "src/index.ts" ]