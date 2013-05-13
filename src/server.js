'use strict';

var config = require('./config.js'),
    express = require('express'),
    server = express();

function virtual(domain, vhost){
    server.use(express.vhost(domain, vhost));
}

function execute(opts, done){
    var db = require('./server/db.js');

    db.connect(function(){
        var market = config.server.slugged ? config.server.slugMarket : false;
        if (market){
            virtual(market, require('./hosts/market/vhost.js'));
        }

        virtual(require('./hosts/dormant/vhost.js')); // TODO: check out vhost function below.
        // if dormant is switched off, then .next() to fall through, somehow?.
        virtual(require('./hosts/blog/vhost.js'));

        server.listen(port, function(){
            console.log('Web server listening on *.%s:%s', port, config.server.tld);

            server.on('close', done);
        });
    });
}

module.exports = {
    execute: execute
};


/*


function vhost(req, res, next){
    if (!req.headers.host) return next();
    var host = req.headers.host.split(':')[0];
    if (req.subdomains = regexp.exec(host)) {
      req.subdomains = req.subdomains[0].split('.').slice(0, -1);
      server.emit('request', req, res);
    } else {
      next();
    }
  };



*/




var s1=express();
        s1.use(function(req,res,next){
            console.log('s1');
            res.end();
        });

var s2=express();
        s2.use(function(req,res,next){
            console.log('s2');
            res.end();
        });
function executefake(opts, done){
    server
        .use(express.vhost('www.local-ponyfoo.com', s1))
        .use(express.vhost('www.local-ponyfoo.com', s2))
        .listen(8081, function(){
            console.log('Web server listening');
        });
}

executefake();