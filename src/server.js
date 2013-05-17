'use strict';

var config = require('./config'),
    express = require('express'),
    server = express(),
    port = config.server.listener,
    platformService = require('./service/platformService.js');

function execute(gruntvars, done){
    var db = require('./db.js');

    db.connect(function(){
        platformService.isInstalled(function(err, installed){
            if(err){
                throw err;
            }

            if(!installed){ // installation is kind of required.
                vhost('install');
            }

            if (config.server.slugged){
                vhost('market');
            }
            vhost('blog');
            server.listen(port, function(){
                console.log('Web server listening on *.%s:%s', config.server.tld, port);

                server.on('close', done);
            });
        });
    });

    function vhost(name){
        var vars = gruntvars[name],
            vserver = require('./hosts/' + name + '/vhost.js'),
            configured = vserver.using(vars);

        server.use(configured);
    }
}

module.exports = {
    execute: execute
};