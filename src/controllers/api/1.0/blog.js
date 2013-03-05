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
            { field: 'title', length: { min: 4, max: 16 }, message: 'Your blog needs a pretty name! Use between 4 and 16 characters' },
            { field: 'legend', length: { max: 24 }, required: false, message: 'A legend can take up to 24 characters' },
            { field: 'meta', length: { max: 300 }, required: false, message: 'The meta description must be under 300 characters' },
            { field: 'description', length: { max: 30000 }, required: false, message: 'Your description markdown can\'t exceed 30k characters in length' },
            // TODO more stuff
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