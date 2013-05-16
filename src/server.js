'use strict';

var config = require('./config'),
    express = require('express'),
    server = express(),
    port = config.server.listener,
    platformService = require('./service/platformService.js');

function execute(opts, done){
    var db = require('./db.js');

    db.connect(function(){
        platformService.isInstalled(function(err, installed){
            if(err){
                throw err;
            }
            if(!installed || true){ // installation is kind of required.
                server.use(require('./hosts/install/vhost.js'));
            }

            if (config.server.slugged){
                server.use(require('./hosts/market/vhost.js'));
            }
            server.use(require('./hosts/blog/vhost.js'));
            server.listen(port, function(){
                console.log('Web server listening on *.%s:%s', config.server.tld, port);

                server.on('close', done);
            });
        });
    });
}

module.exports = {
    execute: execute
};