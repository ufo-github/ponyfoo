var rest = require('../../../services/rest.js');

function upload(req,res){
    var file = req.files.file;
    if(!file){
        rest.badRequest(req,res,{ validation: ['File not received by the matrix']});
        return;
    }

    // TODO: copy over to static/bin, get url for the server
    // TODO return url, together with the filename.

    rest.end(res, {
        url: file.name
    });
}

module.exports = {
    upload: upload
};