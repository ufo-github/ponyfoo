'use strict';

var fs = require('fs'),
    path = require('path'),
    walk = require('walk'),
    config = require('../config.js'),
    dev = config.env.development;

function logger(){
    var out = console;

    function log(level){
        function logLevel(message){
            if(!message){
                return;
            }

            if(dev){
                out.log(level + ': ' + message);
            }
        }

        return logLevel;
    }

    return {
        err: log('ERROR')
    };
}

function args(o){
    return Array.prototype.slice.call(o);
}

function findModules(opts,done){
    var walker  = walk.walk(opts.folder, { followLinks: false }),
        modules = [];

    walker.on('file', function(root, stat, next) {
        var current = path.join(root, stat.name),
            extname = path.extname(current);

        if(extname === '.js' && (opts.filter === undefined || opts.filter(current))){
            var module = require(current);
            modules.push(module);
        }

        next();
    });

    walker.on('end', function() {
        done(modules);
    });
}

function findProperty(on, path){
    var children = path.split('.');
    while(children.length > 0){
        on = on[children.shift()];
    }
    return on;
}

function hasTruthyProperty(obj) {
    for(var prop in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, prop) && !!obj[prop]) {
            return true;
        }
    }
    return false;
}

module.exports = {
    noop: function(){},
    log: logger(),
    args: args,
    findModules: findModules,
    findProperty: findProperty,
    hasTruthyProperty: hasTruthyProperty
};