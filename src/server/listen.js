'use strict';

var config = require('../config.js'),
    port = config.server.listener;

function listen(server, done){
    server.listen(port, function(){
        console.log('Listening on port ' + port );
        process.nextTick(done);
    });
}

module.exports = {
    listen: listen
};