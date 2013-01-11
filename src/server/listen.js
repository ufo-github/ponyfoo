var mongoose = require('mongoose'),
    config = require('../config.js'),
    port = config.server.port,
    mongoUri = config.db.uri;

function listen(server){
    mongoose.connect(mongoUri);
    mongoose.connection.on('open', function() {
        console.log('Connected to Mongoose');
        server.listen(port);
        console.log('Listening on port ' + port );
    });
}

module.exports = {
    listen: listen
};