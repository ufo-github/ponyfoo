'use strict';

var config = require('./config'),
    async = require('async'),
    express = require('express'),
    server = express(),
    port = config.server.port.listener,
    db = require('./db.js'),
    platformService = require('./service/platformService.js');

function execute(gruntvars){
    async.waterfall([
        async.apply(db.connect),
        async.apply(platformService.isInstalled),
        
        function(installed, next){
            if(!installed){
                setup('install');
            }

            if (config.market.on && config.server.slug.enabled){
                setup('market');
            }
            
            setup('blog');
            next();
        },
        function(next){
            if(config.env.development){
                require('dictatorship').overthrow(port, function(){
                    require('./service/audioService.js').beep();
                    next();
                });
            }else{
                next();
            }
        }
    ], function(err){
        if(err){
            throw err;
        }
        listen();
    });

    function setup(name){
        var vars = gruntvars[name],
            vhost = require('./hosts/' + name + '/vhost.js'),
            middleware = vhost.using(vars);

        server.use(middleware);
    }

    function listen(){
        server.listen(port, function(){
            var message = 'Web server listening on *.%s:%s [%s]';
            console.log(message, config.server.tld, port, config.env.current);
        });
    }
}

module.exports = {
    execute: execute
};