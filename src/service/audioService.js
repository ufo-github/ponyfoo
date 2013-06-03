'use strict';

var path = require('path'),
    fs = require('fs'),
    wav = require('wav'),
    Speaker = require('speaker');

module.exports = {
    play: function(sound){
        var filename = sound + '.wav',
            location = path.join(process.cwd(), '/resources/audio/', filename),
            file = fs.createReadStream(location),
            reader = new wav.Reader();

        reader.on('format', function(format) {
            reader.pipe(new Speaker(format));
        });

        file.pipe(reader);
    }
};