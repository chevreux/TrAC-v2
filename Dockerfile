FROM node:14-alpine

WORKDIR /home/trac

COPY package.json yarn.lock tmp/.env ./

RUN yarn --frozen-lockfile

EXPOSE 3000

COPY . .

RUN yarn build

CMD ["yarn", "start"]
