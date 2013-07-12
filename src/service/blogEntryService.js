'use strict';

var validation = require('./validationService.js'),
    Entry = require('../model/Entry.js'),
    permalink = [
        '^\/([0-9]{4})\/',
        '(0[1-9]|1[0-2])\/',
        '(0[1-9]|[12][0-9]|3[01])\/',
        '([a-z0-9\\-]+)$'
    ].join(''),
    rpermalink = new RegExp(permalink);

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

function getDateQuery(date){
    return {
        $gte: new Date(date.year, (date.month || 1)-1, date.day || 1),
        $lt: new Date(date.year, (date.month || 12)-1, date.day || 31, 24)
    };
}

function findByPermalink(permalink, blogId, done){
    var matches = permalink.match(rpermalink);
    if(!matches){
        return process.nextTick(function(){
            done();
        });
    }

    Entry.findOne({
        date: getDateQuery({
            year: matches[1],
            month: matches[2],
            day: matches[3]
        }),
        slug: matches[4],
        blog: blogId
    }, done);
}

function getLatest(options, done){
    Entry
        .find(options.query || {})
        .sort('-date')
        .limit(options.limit)
        .exec(done);
}

function getRelated(entry, done){
    var natural = require('natural'),
        index = new natural.TfIdf();

    // TODO, build index, assign indices to the model
    //       update index 
    // TODO make standalone so EntryIndex has naturalIndex, entryId
    // fetch entry natural index from the db.
    // serialize and deserialize index instead of recreating every time.

    var terms = index.listTerms(entry.naturalIndex).slice(0, 10).join(entry.tags),
        related = [],
        total = 6; // TODO: config.something.related

    index.tfidfs(terms, function(i, weight){
        if(i !== entry.naturalIndex){ // dont relate to ourselves
            related.push({
                index: i,
                weight: weight
            });
        }
    });

    related.sort(function(a, b){
        return a.weight - b.weight;
    });
    related.splice(total);

    return related.map(function(){
        // TODO map to entry where naturalIndex === related.index
    });
}

module.exports = {
    validate: validateEntry,
    findByPermalink: findByPermalink,
    getLatest: getLatest
};