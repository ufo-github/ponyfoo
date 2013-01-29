var controller = require('../../controllers/user.js');

function configure(server){
    server.get('/user/register', controller.guard);
    server.get('/user/login', controller.guard);
    server.get('/user/logout', controller.logout);

    server.post('/user/register', controller.register);


    server.get('/user/login', function(req,res,next){
        console.log(req.flash('error')); // TODO: pass error to client-side view somehow.
        next();
    });

    server.post('/user/login', controller.login);
}


module.exports = {
    configure: configure
};