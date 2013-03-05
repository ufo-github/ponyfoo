var mongoose = require('mongoose'),
    async = require('async'),
    validation = require('../../../services/validation.js'),
    rest = require('../../../services/rest.js'),
    discussion = require('../../../models/blog.js');

function update(req,res){
    console.log(req.blog);
    rest.end(res, {});
}

module.exports = {
    update: update
};