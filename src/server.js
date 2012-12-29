//setup dependencies
var connect = require('connect'),
    express = require('express'),
    io = require('socket.io'),
    port = (process.env.PORT || 8081),
    less = require('less'),
    static = __dirname + '/static';

// setup express
var server = express.createServer();

server.configure(function(){
    server.set('views', __dirname + '/views');
    server.set('view options', { layout: false });
    server.use(connect.bodyParser());
    server.use(express.cookieParser());
    server.use(express.session({ secret: "shhhhhhhhh!"}));
    server.use(express.favicon(__dirname + '/favicon.ico'));
    server.use(express.compiler({ src: static, enable: ['less'] }))
    server.use(connect.static(static));
    server.use(server.router);
});

// setup error handler
server.error(function(err, req, res, next){
    if (err instanceof NotFound) {
        res.render('404.jade', {
            locals: {
                title : '404 - Not Found',
                description: '',
                author: ''
            }, status: 404
        });
    } else {
        res.render('500.jade', {
            locals: {
              title : 'The Server Encountered an Error',
                description: '',
                author: '',
                error: err
            }, status: 500
        });
    }
});

server.listen(port);

// routing
server.get('/*', function(req,res){
    res.render('index.jade');
});

server.post('/write-entry', function(req,res){
    console.log(req);
});

server.get('/500', function(req, res){
    throw new Error('This is a 500 Error');
});

server.get('/*', function(req, res){
    throw new NotFound;
});

function NotFound(msg){
    this.name = 'NotFound';
    Error.call(this, msg);
    Error.captureStackTrace(this, arguments.callee);
}

console.log('Listening on port ' + port );
