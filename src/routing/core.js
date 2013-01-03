var main = require('../controllers/main.js');
var entry = require('../controllers/entry.js');

module.exports = function(server){
    server.get('/*', main.get);

    server.put('/entry', entry.put);
};