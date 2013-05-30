'use strict';

var fs = require('fs');

module.exports = {
    readBase64: function(file, done){
        fs.readFile(file, function(err, data) {
            if(err){
                return done(err);
            }
            var base64 = new Buffer(data).toString('base64');
            done(null, base64);
        });
    }
};