'use strict';

var config = require('./config'),
    express = require('express'),
    server = express(),
    port = config.server.listener,
    platformService = require('./service/platformService.js'),
    install = require('./hosts/install/vhost.js'),
    market = require('./hosts/market/vhost.js'),
    blog = require('./hosts/blog/vhost.js');

function execute(opts, done){
    var db = require('./db.js');

    db.connect(function(){
        platformService.isInstalled(function(err, installed){
            if(err){
                throw err;
            }
            if(!installed || true){ // installation is kind of required.
                server.use(install.using(opts));
            }

            if (config.server.slugged){
                server.use(market.using(opts));
            }
            server.use(blog.using(opts));
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