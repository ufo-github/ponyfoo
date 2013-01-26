var mongoose = require('mongoose'),
    config = require('../config.js'),
    port = config.server.listener,
    mongoUri = config.db.uri;

function listen(server, done){
    mongoose.connect(mongoUri);
    mongoose.connection.on('open', function() {
        console.log('Connected to Mongoose');
        server.listen(port);
        console.log('Listening on port ' + port );
        done();
    });
}

module.exports = {
    listen: listen
};