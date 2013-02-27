var config = require('../config.js'),
    path = require('path'),
    $ = require('../services/$.js'),
    zombie = require('../logic/zombie.js'),
    site = require('../controllers/site.js');

function staticNotFound(req, res){
    res.redirect('/');
}

function mapRouting(server, done){
    $.findModules({ folder: path.join(__dirname, '/routing') }, configure);

    function configure(modules){
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
        done();
    }
}

module.exports = {
    map: mapRouting
};