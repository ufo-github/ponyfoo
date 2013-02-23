var formidable = require('formidable'),
    rest = require('../../../services/rest.js');

function upload(req,res){
    var form = new formidable.IncomingForm();

    form.parse(req, function(err, fields, files) {
        console.log(err);
        console.log(fields);
        console.log(files);
        rest.end(res, {fields: fields, files: files});
    });
}

module.exports = {
    upload: upload
};