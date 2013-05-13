'use strict';

var flash = require('connect-flash');

function configure(server){
    server.use(flash());
    server.use(function(req,res,next){
        var render = res.render;
        res.render = function(view, locals, callback){
            res.locals.flash = req.flash(); // fetch
            res.locals.flash.json = JSON.stringify(res.locals.flash);
            res.render = render;
            res.render(view, locals, callback);
        };
        next();
    });
}

module.exports = {
    configure: configure
};