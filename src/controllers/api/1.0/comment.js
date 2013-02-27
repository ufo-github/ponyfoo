var mongoose = require('mongoose'),
    async = require('async'),
    apiConf = require('../config.js'),
    validation = require('../../../services/validation.js'),
    rest = require('../../../services/rest.js'),
    discussion = require('../../../models/discussion.js'),
    comment = require('../../../models/comment.js'),
    entry = require('../../../models/entry.js'),
    crud = require('../../../services/crud.js')(discussion);

function discuss(req,res){
    var id = mongoose.Types.ObjectId(req.params.entryId);
    document = new discussion({ entry: id });

    add(req,res,document,true);
}

function reply(req,res){
    discussion.findOne({ _id: req.params.id }, function(err, document){
        if(err){
            throw err;
        }
        add(req,res,document,false);
    });
}

function validate(req,res){
    return validation.validate(req,res,{
        document: { text: req.body.comment },
        rules: [
            { field: 'text', length: 10, message: 'Your comment must be at least 10 characters long' }
        ]
    });
}

function add(req,res,document,root){
    if(!validate(req,res)){
        return;
    }

    var data = {
            text: req.body.comment,
            author: {
                id: req.user._id,
                displayName: req.user.displayName,
                gravatar: req.user.gravatar,
                blogger: req.user.blogger
            },
            root: root
        },
        model = new comment(data);

    document.comments.push(model);
    document.save(function(err){
        rest.resHandler(err,{
            res: res,
            then: function(){
                rest.end(res, {
                    discussion: document._id,
                    comment: actionMapper(req)(model)
                });
            }
        });
    });
}

function list(req,res){
    var id = mongoose.Types.ObjectId(req.params.entryId);
    discussion.find({ entry: id }).sort('date').exec(callback);

    function discussionObjects(discussions){
        if(!req.user){
            return discussions;
        }

        return discussions.map(function(d){
            d = d.toObject();
            d.comments = d.comments.map(actionMapper(req));

            return d;
        });
    }

    function callback(err,documents){
        rest.resHandler(err, {
            res: res,
            then: function(){
                rest.end(res,{
                    discussions: discussionObjects(documents)
                });
            }
        });
    }
}

function editable(comment){
    return new Date() - comment.date < apiConf.comments.editableFor;
}

function actionMapper(req){
    return function(c){
        var actions;

        if (c.toObject !== undefined){
            c = c.toObject();
        }

        if(req.user.blogger){
            actions = {
                remove: true,
                edit: true
            };
        }else if(c.author.id.equals(req.user._id)){
            actions = { remove: true };

            if(editable(c)){
                actions.edit = true;
            }
        }
        c.actions = actions;
        return c;
    };
}

function findComment(req, res, then){
    var id = mongoose.Types.ObjectId(req.params.id),
        commentId = mongoose.Types.ObjectId(req.params.commentId);

    discussion.findOne({ _id: id }, function(err, discussion){
        if(err){
            rest.resHandler(err,{res:res});
            return;
        }

        var comment = discussion.comments.id(commentId), blogger, authorized;
        if (comment === null){
            rest.notFound(req,res);
            return;
        }

        blogger = req.user.blogger === true;
        authorized = blogger ||  comment.author.id.equals(req.user._id);

        if(!authorized){
            rest.unauthorized(req,res);
            return;
        }

        then(discussion, comment, function (err){
            rest.resHandler(err,{res:res});
        });
    });
}

function del(req, res){
    findComment(req, res, function(discussion, comment, done){
        if(comment.root){
            discussion.remove(done);
        }else{
            comment.remove();
            discussion.save(done);
        }
    });
}

function edit(req,res){
    findComment(req,res, function(discussion, comment, done){
        if(req.user.blogger !== true && !editable(comment)){
            rest.badRequest(req,res, {
                validation: [
                    'Your comment can\'t be edited anymore'
                ]
            });
            return;
        }

        if (!validate(req,res)){
            return;
        }

        comment.text = req.body.comment;
        discussion.save(done);
    });
}

function discussions(req,res){
    crud.list({
        listName: 'discussions',
        limit: apiConf.paging.limit,
        page: req.params.page,
        sort: '-date',
        mapper: function(documents, cb){
            async.map(documents, function(document, done){
                entry.findOne({ _id: document.entry }, function(err, entry){
                    if(err){
                        done(err);
                        return;
                    }

                    done(null, {
                        _id: document._id,
                        comments: document.comments,
                        last: document.comments[document.comments.length - 1],
                        entry: {
                            _id: document.entry,
                            permalink: entry.permalink
                        }
                    });
                });
            }, function(err, documents){
                if(err){
                    cb(err);
                    return;
                }

                cb(null, documents.sort(function(a, b){
                    return a.last.date < b.last.date ? -1 : 1;
                }));
            });
        }
    }, rest.wrapCallback(res));
}

module.exports = {
    get: list,
    discussions: discussions,
    discuss: discuss,
    reply: reply,
    del: del,
    edit: edit
};