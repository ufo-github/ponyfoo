'use strict';

var path = require('path'),
    bin = path.join(process.cwd(), '/src/.bin');

module.exports = {
    metadata: path.join(bin, '/meta')
};