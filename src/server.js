//setup dependencies
var config = require('./config.js'),
    express = require('express'),
    port = config.server.port,
    assets = __dirname + '/static'
    mongoose = require('mongoose'),
	mongoUri = config.db.uri,;

// setup express
var server = express.createServer();

server.configure(function(){
    server.set('views', __dirname + '/views');
    server.set('view options', { layout: false });
    server.use(express.favicon(assets + '/images/favicon.ico'));
    server.use(express.compiler({ src: assets, enable: ['less'] }));
    server.use(express.static(assets));

    server.use(express.logger({ format: 'dev' }));

    server.use(express.errorHandler({
        showStack: true,
        dumpExceptions: true
    }));

    server.use(express.bodyParser());
    server.use(server.router);
});

// setup error handler
server.error(function(err, req, res, next){
    res.render('500.jade', {
        locals: {
            error: err
        }, status: 500
    });
});

mongoose.connect(mongoUri);
mongoose.connection.on('open', function() {
    console.log('Connected to Mongoose');
});

require('./routing/core.js')(server);

server.listen(port);
console.log('Listening on port ' + port );
