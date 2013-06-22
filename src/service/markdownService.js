'use strict';

var path = require('path'),
    fs = require('fs'),
    marked = require('ultramarked');

marked.setOptions({
    breaks: true,
    smartLists: true,
    ultralight: true,
    ultrasanitize: true
});

function parse(markdown){
    return marked(markdown);
}

module.exports = {
    readFile: function(file){
        var absolute = path.resolve(process.cwd(), file),
            markdown = fs.readFileSync(absolute);

        return parse(markdown.toString());
    },
    parse: parse
};