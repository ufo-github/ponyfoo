var vserver = require('../common/vserver.js'),
    server = vserver('*', __dirname);

module.exports = server; // export the middleware