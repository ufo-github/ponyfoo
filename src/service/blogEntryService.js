'use strict';

var validation = require('./validationService.js');

function validateEntry(req,res,update){
    var source = req.body.entry || {};

    return validation.validate(req,res,{
        ignoreUndefined: update,
        document: {
            title: source.title,
            brief: source.brief,
            text: source.text,
            tags: source.tags
        },
        rules: [
            { field: 'title', length: { min: 6, max: 50 }, message: 'The article\'s title should be somewhere between 6 and 50 characters long' },
            { field: 'brief', length: 20, message: 'Please remember to write an introduction to your post. Use at least 20 characters' },
            { field: 'brief', length: { max: 10000 }, required: false, message: 'Your introduction\'s markdown shouldn\'t exceed 10k characters in length' },
            { field: 'text', length: 30, message: 'That was pretty scarce. Do you mind sharing at least a pair of sentences in your article? Type at least 30 characters' },
            { field: 'text', length: { max: 30000 }, required: false, message: 'Your article\'s markdown can\'t exceed 30k characters in length' },
            { field: 'tags', validator: function(){
                var empty = 'Tag your article with at least one keyword',
                    generic = 'Tags can only contain letters, numbers, or punctuation',
                    tags = this, i = 0, len = tags.length, tag;

                if(!Array.isArray(tags) || tags.length === 0){
                    return empty;
                }else if(tags.length > 6){
                    return 'Six tags are enough. Pick the most relevant ones';
                }

                for(; i < len; i++){
                    if(typeof tags[i] === 'string'){
                        tags[i] = tags[i].replace(/ /g,'').toLowerCase();
                        if(tags[i].length === 0){
                            return empty;
                        }else if(!/^[a-z0-9._\-]+$/.test(tags[i])){
                            return generic;
                        }
                    }else{
                        return generic;
                    }
                }
            }}
        ]
    });
}

module.exports = {
    validate: validateEntry
};