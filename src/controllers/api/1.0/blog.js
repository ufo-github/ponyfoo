var blog = require('../../../models/blog.js'),
    crud = require('../../../services/crud.js')(blog),
    validation = require('../../../services/validation.js'),
    rest = require('../../../services/rest.js');

function validate(req,res){
    if(!req.body.blog || !req.body.blog.social){
        return undefined;
    }
    var input = req.body.blog,
        social = input.social;
    
    return validation.validate(req,res,{
        document: {
            title: input.title,
            legend: input.legend,
            meta: input.meta,
            thumbnail: input.thumbnail,
            description: input.description,
            social: {
                rss: social.rss,
                email: social.email,
                github: social.github,
                stackoverflow: social.stackoverflow,
                careers: social.careers,
                linkedin: social.linkedin,
                twitter: social.twitter
            }
        },
        rules: [

        ]
    });
}

function update(req,res){
    var document = validate(req,res);
    if (document === undefined){
        return;
    }

    crud.update({ _id: req.blog._id }, document, {
        res: res
    });
}

module.exports = {
    update: update
};