var async = require('async'),
    rest = require('../../../services/rest.js'),
    discussion = require('../../../models/discussion.js'),
    comment = require('../../../models/comment.js');

function discuss(req,res){
    var entry = req.params.entryId,
        model = new discussion({ entry: mongoose.Types.ObjectId(entry) });

    add(req,res,model);
}

function insert(req,res){
    discussion.findOne({ _id: req.params.id }, function(err, discussion){
        if(err){
            throw err;
        }
        add(req,res,discussion);
    });
}

function add(req,res,model){
    var document = {
        text: req.body.comment,
        author: {
            id: mongoose.Types.ObjectId(req.user._id),
            displayName: req.user.displayName
        }
    };

    model.comments.push(document);
    model.save(function(err){
        rest.resHandler(err,{
            res: res
        });
    });
}

module.exports = {
    get: null,
    discuss: discuss,
    ins: insert
};