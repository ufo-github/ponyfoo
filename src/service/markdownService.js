'use strict';

var path = require('path'),
    fs = require('fs'),
    pagedown = require('pagedown');

module.exports = {
    readFile: function(file){
        var absolute = path.resolve(process.cwd(), file),
            md = fs.readFileSync(absolute),
            pd = new pagedown.getSanitizingConverter();

        return pd.makeHtml(md.toString());
    }
};