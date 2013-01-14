module.exports = {
    get: function(req,res){
        if(!req.user){
            res.render('anon.jade');
        }else if(req.user.author !== true){
            res.render('anon.jade');
        }else{
            res.render('author.jade');
        }
    }
};