var jsn = require('jsn'),
    fs = require('fs'),
    config = require('../config.js');

function output(done){
    fs.readFile(config.opensearch.source, function(err, data){
        if(err){
            throw err;
        }

        jsn.parse(data.toString(), config, function(err, parsed){
            if(err){
                throw err;
            }

            fs.writeFile(config.opensearch.bin, parsed, done);
        });
    });
}

module.exports = {
    output: output
};