var mongoose = require('mongoose'),
    pagedown = require('pagedown'),
    jsdom = require('jsdom'),
    config = require('../config.js'),
    schema = new mongoose.Schema({
        title: { type: String, require: true, trim: true },
        slug: { type: String, require: true, trim: true },
        brief: { type: String, require: true },
        text: { type: String, require: true },
        date: { type: Date, index: { unique: false }, require: true },
		updated: { type: Date, require: true, default: Date.now }
    });

schema.methods.getUrl = function() {
    var year = '/' + this.date.getFullYear(),
        month = '/' + (this.date.getMonth() + 1), // 0-based,
        day = '/' + this.date.getDay(),
        slug = '/' + this.slug;

    return config.server.authority + year + month + day + slug;
};

schema.methods.getPlainTextBrief = function(done) {
    var converter = new pagedown.getSanitizingConverter(),
        html = converter.makeHtml(this.brief);

    jsdom.env({
        html: '<foo>' + html + '</foo>', // empty and HTML tags throw for some obscure reason.
        scripts: [config.jQuery.local],
        done: function(err,window){
            if(err){
                done(err);
                return;
            }
            var $ = window.$,
                plain = $(':root').text();

            done(null,plain);
        }
    });
};

module.exports = mongoose.model('entry', schema);