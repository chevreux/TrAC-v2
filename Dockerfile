FROM node:14-alpine

RUN ls -a

RUN cd home

RUN ls -a

RUN cd /tmp

RUN ls -a

WORKDIR /home/trac

RUN ls -a

COPY package.json yarn.lock ./
# COPY package.json yarn.lock /tmp/.env ./

RUN ls -a

RUN cd /

RUN ls -a

RUN cd /tmp/

RUN ls -a

RUN yarn --frozen-lockfile

EXPOSE 3000

COPY . .

RUN yarn build

CMD ["yarn", "start"]
