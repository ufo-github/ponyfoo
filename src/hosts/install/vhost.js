var vserver = require('../common/vserver.js'),
    server = vserver('*', __dirname),
    routing = require('./routing.js');

routing.setup(server);

module.exports = server; // export the middleware