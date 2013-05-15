'use strict';

var config = require('./config.js'),
    express = require('express'),
    server = express(),
    port = config.server.listener,
    platform = require('./service/platformService.js');

function execute(opts, done){
    var db = require('./db.js');

    db.connect(function(){
        platform.isInstalled(function(err, installed){
            if(err){
                throw err;
            }
            if(!installed){ // installation is kind of required.
                server.use(require('./hosts/install/vhost.js'));
            }

            if (config.server.slugged){
                server.use(require('./hosts/market/vhost.js'));
            }
            server.use(require('./hosts/blog/vhost.js'));
            server.listen(port, function(){
                console.log('Web server listening on *.%s:%s', port, config.server.tld);

                server.on('close', done);
            });
        });
    });
}

module.exports = {
    execute: execute
};