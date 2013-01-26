var path = require('path'),
    walk = require('walk'),
    site = require('../controllers/site.js');

function findModules(done){
    var folder = path.join(__dirname, '/routing'),
        walker  = walk.walk(folder, { followLinks: false }),
        modules = [];

    walker.on('file', function(root, stat, next) {
        var current = path.join(root, stat.name),
            extname = path.extname(current);

        if(extname === '.js'){
            var module = require(current);
            modules.push(module);
        }
        next();
    });

    walker.on('end', function() {
        done(modules);
    });
}

function routing(server, done){
    findModules(function(modules){
        modules.forEach(function(module){
            module.configure(server);
        });
        server.get('/*', site.get); // GET catch-all

        done();
    });
}

module.exports = {
    map: routing
};