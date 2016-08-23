FROM mhart/alpine-node:6

LABEL name "ponyfoo"

MAINTAINER Nicolás Bevacqua <nico@ponyfoo.com>

RUN apk add --update \
  autoconf \
  automake \
  bash \
  curl \
  g++ \
  gcc \
  git \
  libpng-dev \
  libtool \
  make \
  nasm \
  python

# graphicsmagick
RUN echo "http://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories \
 && apk add --update graphicsmagick \
 && rm -rf /var/cache/apk/*

WORKDIR /usr/src

COPY package.json package.json

RUN npm install --production

COPY . .

EXPOSE 3000

ENTRYPOINT ["npm run start-cluster"]
