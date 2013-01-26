var config = require('../config.js'),
    mongoose = require('mongoose'),
    mongoUri = config.db.uri;

function connect(done){
    mongoose.connect(mongoUri);
    mongoose.connection.on('open', function() {
        console.log('Connected to Mongoose');
        done();
    });
}

module.exports = {
    connect: connect
};