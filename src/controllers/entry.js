module.exports = {
    put: function(req,res){
        console.log(req.body.entry);
        res.end();
    }
};