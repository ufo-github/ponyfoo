'use strict';

var path = require('path');

function staticNotFound(req, res){
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end();
}

function configure(server){
    server.get('/img/*', staticNotFound);
    server.get('/js/*', staticNotFound);
    server.get('/css/*', staticNotFound);
}

module.exports = {
    configure: configure
};