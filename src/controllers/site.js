module.exports = {
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