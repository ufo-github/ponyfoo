var rest = require('../../../services/rest.js'),
    discussion = require('../../../models/discussion.js'),
    comment = require('../../../models/comment.js');

function discuss(req,res){
    var entry = req.params.entryId,
        document = new discussion({ entry: mongoose.Types.ObjectId(entry) });

    add(req,res,document);
}

function insert(req,res){
    discussion.findOne({ _id: req.params.id }, function(err, document){
        if(err){
            throw err;
        }
        add(req,res,document);
    });
}

function add(req,res,document){
    var model = {
        text: req.body.comment,
        author: {
            id: mongoose.Types.ObjectId(req.user._id),
            displayName: req.user.displayName
        }
    };

    document.comments.push(model);
    document.save(function(err){
        rest.resHandler(err,{
            res: res
        });
    });
}

function list(req,res){
    discussion.query({ entry: mongoose.Types.ObjectId(req.params.id) }, callback);

    function callback(err,documents){
        rest.resHandler(err, {
            res: res,
            then: function(){
                rest.end(res,documents);
            }
        });
    }
}

module.exports = {
    get: list,
    discuss: discuss,
    ins: insert
};