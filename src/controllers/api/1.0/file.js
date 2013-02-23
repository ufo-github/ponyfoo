var async = require('async'),
    path = require('path'),
    fs = require('fs'),
    fse = require('fs-extra'),
    rest = require('../../../services/rest.js'),
    config = require('../../../config.js');

function upload(req,res){
    var file = req.files.file, folder, filename, url;
    if(!file){
        rest.badRequest(req,res,{ validation: ['File not received by the matrix']});
        return;
    }

    folder = '/img/uploads/';
    filename = path.basename(file.path) + '_' + file.name;
    url = folder + filename;

    async.parallel([
        async.apply(fse.copy, file.path, path.join(config.static.folder, folder, filename)),
        async.apply(fse.copy, file.path, path.join(config.static.bin, folder, filename))
    ], function(){
        rest.end(res, {
            alt: file.name,
            url: url
        });
    });
}

module.exports = {
    upload: upload
};