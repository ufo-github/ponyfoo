var site = require('../controllers/site.js'),
    apiRoutes = require('../controllers/api/routing.js'),
    passport = require('passport');

function routing(server){
    apiRoutes(server);

    server.post('/user/login', passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/user/login'
    }));
    server.post('/user/logout', function(req,res){
        req.logout();
        req.redirect('/');
    });

    server.get('/*', site.get);
}

module.exports = {
    map: routing
};