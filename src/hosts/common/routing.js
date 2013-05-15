'use strict';

var path = require('path'),
    zombie = require('../logic/zombie.js');

function staticNotFound(req, res){
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end();
}

function configure(server){
    server.get('/img/*', staticNotFound);
    server.get('/js/*', staticNotFound);
    server.get('/css/*', staticNotFound);

    // TODO move to blog, the rest aren't ajax, won't need crawler fancy stuff
    server.get('/*', zombie.setup(server).proxy); // crawler interceptor

    // TODO sitemaps rss opensearch
}

module.exports = {
    configure: configure
};