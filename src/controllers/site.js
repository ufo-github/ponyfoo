module.exports = {
    get: function(req,res){
        if(!req.user){
            res.render('anon.jade', { profile: 'anon' });
        }else if(req.user.author !== true){
            res.render('anon.jade', { profile: 'anon' });
        }else{
            res.render('author.jade', { profile: 'author' });
        }
    }
};