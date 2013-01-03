//setup dependencies
var config = require('./config.json'),
    express = require('express'),
    mongoose = require('mongoose'),
    port = process.env.PORT || config.server.port,
    _static = __dirname + '/static';

// setup express
var server = express.createServer();

server.configure(function(){
    server.set('views', __dirname + '/views');
    server.set('view options', { layout: false });
    server.use(express.favicon(_static + '/images/favicon.ico'));
    server.use(express.compiler({ src: _static, enable: ['less'] }));
    server.use(express.static(_static));

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

mongoose.connect(config.db.uri);
mongoose.connection.on('open', function() {
    console.log('Connected to Mongoose');
});

require('./routing/core.js')(server);

server.listen(port);
console.log('Listening on port ' + port );
