var mongoose = require('mongoose'),
    moment = require('moment'),
    pagedown = require('pagedown'),
    jsdom = require('jsdom'),
    config = require('../config.js'),
    ObjectId = mongoose.Schema.Types.ObjectId,
    schema = new mongoose.Schema({
        title: { type: String, require: true, trim: true },
        slug: { type: String, require: true, trim: true },
        brief: { type: String, require: true },
        text: { type: String, require: true },
        date: { type: Date, index: { unique: false }, require: true, default: Date.now },
		updated: { type: Date, require: true, default: Date.now },
        previous: { type: ObjectId, index: { unique: false }, default: null },
        next: { type: ObjectId, index: { unique: false }, default: null }
    },{ id: false, toJSON: { getters: true } });

schema.virtual('permalink').get(function(){
    return this.getPermalink();
});

schema.methods.getPermalink = function(absolute){
    var date = moment(this.date).format('YYYY/MM/DD'),
        permalink = '/' + date + '/' + this.slug;

    if(absolute === true){
        return config.server.authority + permalink;
    }
    return permalink;
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