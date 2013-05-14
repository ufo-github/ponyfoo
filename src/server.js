'use strict';

var config = require('./config.js'),
    express = require('express'),
    server = express(),
    port = config.server.listener;

function execute(opts, done){
    var db = require('./common/db.js');

    db.connect(function(){
        if (config.server.slugged){
            server.use(require('./hosts/market/vhost.js'));
        }

        // TODO: pass middleware to each vhost, so they can stop themselves at any point.
        // TODO: install vhost should be disabled after configuration.
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