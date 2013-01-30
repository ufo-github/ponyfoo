module.exports = {
    get: function(req,res){
        var profile;

        if(!req.user){
            profile = 'anon';
        }else if(req.user.author !== true){
            profile = 'registered';
        }else{
            profile = 'author';
        }

        res.render('layouts/' + profile + '.jade', { profile: profile });
    }
};