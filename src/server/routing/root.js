var sitemap = require('../../logic/sitemap.js');

function configure(server){
    server.get('/sitemap.xml', function(req, res) {
        sitemap.current.toXML(function(xml) {
            res.header('Content-Type', 'application/xml');
            res.send(xml);
        });
    });
}

module.exports = {
    configure: configure
};