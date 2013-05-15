var vserver = require('../common/vserver.js'),
    server = vserver('www', __dirname);

module.exports = server; // export the middleware