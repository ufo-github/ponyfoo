'use strict';

var config = require('../config'),
    mustache = require('mustache'),
    path = require('path'),
    fs = require('fs'),
    root = path.join(process.cwd(), '/templates'),
    compiled = {};

function read(file, done){
    if(file in compiled){
        return process.nextTick(function(){
            done(null, compiled[file]);
        });
    }

    fs.readFile(path.join(root, file), function(err, data){
        if(err){
            return done(err);
        }
        compiled[file] = mustache.compile(data.toString());
        done(null, compiled[file]);
    });
}

module.exports = {
    render: function(file, model, done){
        read(file, function(err, fn){
            if(err){
                return done(err);
            }

            var result = fn(model);
            done(null, result);
        });
    }
};