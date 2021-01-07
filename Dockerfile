FROM node:14-alpine

WORKDIR /

RUN ls -a

WORKDIR /home

RUN ls -a

WORKDIR /tmp

RUN ls -a

WORKDIR /home/trac

RUN ls -a

COPY package.json yarn.lock ./
# COPY package.json yarn.lock /tmp/.env ./

RUN ls -a

RUN yarn --frozen-lockfile

EXPOSE 3000

COPY . .

RUN yarn build

CMD ["yarn", "start"]
