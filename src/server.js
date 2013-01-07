var config = require('./config.js'),
	connect = require('connect'),
    express = require('express'),
    port = config.server.port,
    assets = __dirname + '/static',
    mongoose = require('mongoose'),
	mongoUri = config.db.uri;

var server = express();

server.configure('production', function(){
	server.use(connect.compress());
});

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

mongoose.connect(mongoUri);
mongoose.connection.on('open', function() {
    console.log('Connected to Mongoose');
	server.listen(port);
	console.log('Listening on port ' + port );
});

require('./routing/core.js')(server);