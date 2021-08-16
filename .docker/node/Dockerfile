FROM node:16-alpine as dev
ENV NODE_ENV development
EXPOSE 3333 9229
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn install
ENTRYPOINT ["yarn"]
CMD ["start", "api"]


