FROM node:16-alpine as build
WORKDIR /usr/src/app
COPY . ./
RUN yarn install
RUN yarn build api

FROM node:16-alpine as build-runtime
ARG NODE_ENV=production
WORKDIR /usr/src/app
RUN apk update && apk add --no-cache \
  curl \
  bash \
  && rm -rf /var/cache/apk/*
COPY package.json .
COPY yarn.lock .
COPY prisma/ ./
RUN yarn install
COPY --from=build /usr/src/app/dist ./src

FROM node:16-alpine
ENV NODE_ENV production
ENV APP_PORT 3333
EXPOSE 3333
WORKDIR /usr/src/app
RUN apk add --no-cache tini
COPY --chown=node:node --from=build-runtime /usr/src/app ./
USER node
ENTRYPOINT ["/sbin/tini", "--", "node"]
CMD ["./src/apps/api/main.js"]
