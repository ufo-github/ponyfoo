var path = require('path'),
    $ = require('../services/$.js'),
    site = require('../controllers/site.js');

function mapRouting(server, done){
    $.findModules({ folder: path.join(__dirname, '/routing') }, configure);

    function configure(modules){
        modules.forEach(function(module){
            module.configure(server);
        });

        server.get('/*', site.get); // GET catch-all

        done();
    }
}

module.exports = {
    map: mapRouting
};