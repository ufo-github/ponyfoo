var mongoose = require('mongoose'),
    moment = require('moment'),
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
    var date = moment(this.date).format('YYYY/MM/DD'),
        slug = this.slug;

    return config.server.authority + '/' + date + '/' + slug;
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