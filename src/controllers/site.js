module.exports = {
    get: function(req,res){
        var profile, locals;

        if(!req.user){
            profile = 'anon';
        }else if(req.user.author !== true){
            profile = 'registered';
        }else{
            profile = 'author';
        }

        locals = JSON.stringify({
            profile: profile,
            connected: req.user !== undefined,
            author: profile === 'author'
        });

        res.locals.assetify.js.add('!function(a){a.locals=' + locals + ';}(nbrut);');
        res.render('layouts/' + profile + '.jade', { profile: profile });
    }
};