'use strict';

var config = require('./config.js'),
    express = require('express'),
    server = express(),
    port = config.server.listener;

function execute(opts, done){
    var db = require('./db.js');

    db.connect(function(){
        if (config.server.slugged){
            server.use(require('./hosts/market/vhost.js'));
        }

        server.use(require('./hosts/install/vhost.js'));
        server.use(require('./hosts/blog/vhost.js'));

        server.listen(port, function(){
            console.log('Web server listening on *.%s:%s', port, config.server.tld);

            server.on('close', done);
        });
    });
}

module.exports = {
    execute: execute
};