var sitemap = require('../../logic/sitemap.js'),
    opensearch = require('../../logic/opensearch.js');

function configure(server){
    server.get('/sitemap.xml', sitemap.get);
    server.get('/opensearch.xml', opensearch.get);
}

module.exports = {
    configure: configure
};