'use strict';

var jsn = require('jsn'),
    fs = require('fs'),
    config = require('../config');

module.exports = {
    configure: function(source){
        var xmln;

        function getXmln(done){
            if(xmln){
                return process.nextTick(function(){
                    done(null, xmln);
                });
            }

            fs.readFile(source, function(err, data){
                if(err){
                    return done(err);
                }

                xmln = data.toString();
                done(null, xmln);
            });
        }

        return  {
            serve: function(res, context, next){
                getXmln(function(err, xmln){
                    if(err){
                        return next(err);
                    }

                    jsn.parse(xmln, context, function(err, xml){
                        if(err){
                            return next(err);
                        }

                        res.header('Content-Type', 'application/xml');
                        res.end(xml);
                    });
                });
            }
        };
    }
};