module.exports = {
    get: function(req,res){
        var profile, locals;

        if(!req.user){
            profile = 'anon';
        }else if(req.user.blogger !== true){
            profile = 'registered';
        }else{
            profile = 'blogger';
        }

        locals = JSON.stringify({
            profile: profile,
            connected: req.user !== undefined,
            blogger: profile === 'blogger'
        });

        res.locals.assetify.js.add('!function(a){a.locals=' + locals + ';}(nbrut);');
        res.render('layouts/' + profile + '.jade', { profile: profile });
    }
};