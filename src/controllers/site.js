module.exports = {
    get: function(req,res){
        if(!req.user){
            res.render('anon.jade', { assetProfile: 'anon' });
        }else if(req.user.author !== true){
            res.render('anon.jade', { assetProfile: 'anon' });
        }else{
            res.render('author.jade', { assetProfile: 'author' });
        }
    }
};