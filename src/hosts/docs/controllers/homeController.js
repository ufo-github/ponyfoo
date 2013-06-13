'use strict';

module.exports = {
    getIndex: function(req, res, next){
        res.render('home/index.jade', {
            profile: 'all'
        });
    }
};