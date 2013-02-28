var config = require('../config.js');

module.exports = {
    hostValidation: function(req,res,next){
        var val = config.server.hostRegex;
        if (val !== undefined && !val.test(req.host)){
            res.redirect(config.server.authority + req.url, 301);
            return;
        }
        next();
    },
    get: function(req,res){
        var profile, locals, connected = req.user !== undefined;

        if(!connected){
            profile = 'anon';
        }else if(req.user.blogger !== true){
            profile = 'registered';
        }else{
            profile = 'blogger';
        }

        if(!connected){
            locals = JSON.stringify({
                profile: 'anon',
                connected: false
            });
        }else{
            locals = JSON.stringify({
                id: req.user._id,
                profile: profile,
                connected: true,
                blogger: profile === 'blogger'
            });
        }

        res.locals.assetify.js.add('!function(a){a.locals=' + locals + ';}(nbrut);');
        res.render('layouts/' + profile + '.jade', { profile: profile });
    }
};