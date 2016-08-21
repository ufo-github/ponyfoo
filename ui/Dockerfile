FROM debian:jessie

MAINTAINER Nicolás Bevacqua <nico@ponyfoo.com>

RUN apt-get update && apt-get install -y \
  build-essential \
	curl \
	g++ \
  git \
  graphicsmagick \
	make \
	python

# python-software-properties
# software-properties-common
# lsof
# libkrb5-dev
# apache2-utils
# bzip2

RUN curl -sL https://deb.nodesource.com/setup_6.x | bash -

RUN apt-get update && apt-get install -y \
	nodejs

COPY . /var/www/app

RUN cd /var/www/app ; npm install

EXPOSE 3000

CMD ["node", "/var/www/app/cluster.js"]
