var config = require('../config.js'),
    path = require('path'),
    $ = require('../services/$.js'),
    zombie = require('../logic/zombie.js'),
    site = require('../controllers/site.js');

function staticNotFound(req, res){
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end();
}

function mapRouting(server, done){
    $.findModules({ folder: path.join(__dirname, '/routing') }, configure);

    function configure(modules){
        server.all('/*', site.hostValidation); // validate we're on the right host, append blog-related request parameters

        modules.forEach(function(module){
            module.configure(server);
        });

        server.get('/img/*', staticNotFound);
        server.get('/js/*', staticNotFound);
        server.get('/css/*', staticNotFound);

        if(config.zombie.enabled){
            server.get('/*', zombie.setup(server).serve); // crawler pass-through catch-all
        }

        server.get('/*', site.get); // GET catch-all
        server.post('/claim', site.claim); // POST to claim a blog slug
        done();
    }
}

module.exports = {
    map: mapRouting
};