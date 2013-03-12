var sitemap = require('../../logic/sitemap.js'),
    opensearch = require('../../logic/opensearch.js'),
    feed = require('../../logic/feed.js');

function configure(server){
    server.get('/sitemap.xml', sitemap.get);
    server.get('/opensearch.xml', opensearch.get);
    server.get('/rss/latest.xml', feed.get);
}

module.exports = {
    configure: configure
};