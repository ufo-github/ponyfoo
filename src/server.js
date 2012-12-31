//setup dependencies
var connect = require('connect'),
    express = require('express'),
    io = require('socket.io'),
    port = (process.env.PORT || 8081),
    less = require('less'),
    _static = __dirname + '/static';

// setup express
var server = express.createServer();

server.configure(function(){
    server.set('views', __dirname + '/views');
    server.set('view options', { layout: false });
    server.use(connect.bodyParser());
    server.use(express.cookieParser());
    server.use(express.session({ secret: "shhhhhhhhh!"}));
    server.use(express.favicon(__dirname + '/favicon.ico'));
    server.use(express.compiler({ src: _static, enable: ['less'] }))
    server.use(connect.static(_static));
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

server.listen(port);

// routing
server.get('/*', function(req,res){
    res.render('index.jade');
});

server.post('/write-entry', function(req,res){
    // todo ajax way !
    var entry = {
        title: req.body['entry.title'],
        brief: req.body['entry.brief'],
        text: req.body['entry.text']
    };
    console.log(entry);
});

console.log('Listening on port ' + port );
