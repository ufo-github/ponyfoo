'use strict';

var path = require('path'),
    fs = require('fs'),
    pagedown = require('pagedown');

function parse(markdown){
    var pd = new pagedown.getSanitizingConverter();
    return pd.makeHtml(markdown);
}

module.exports = {
    readFile: function(file){
        var absolute = path.resolve(process.cwd(), file),
            markdown = fs.readFileSync(absolute);

        return parse(markdown.toString());
    },
    parse: parse
};