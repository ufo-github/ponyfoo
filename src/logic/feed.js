var rss = require('rss'),
    config = require('../config.js');

function rebuild(){
    var feed = new rss({
        title: config.site.title,
        description: config.site.description,
        author: config.author.name,
        site_url: config.site.url,

    });
}

module.exports = {
    rebuild: rebuild
};