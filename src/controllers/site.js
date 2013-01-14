module.exports = {
    get: function(req,res){
        if(!req.user){
            res.render('site.jade');
        }else if(req.user.author !== true){
            res.render('site.jade');
        }else{
            res.render('author.jade');
        }
    }
};