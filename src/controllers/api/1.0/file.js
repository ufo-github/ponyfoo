var async = require('async'),
    path = require('path'),
    fs = require('fs'),
    fse = require('fs-extra'),
    imgur = require('imgur'),
    rest = require('../../../services/rest.js'),
    config = require('../../../config.js');

function upload(req,res){
    var file = req.files.file;
    if(!file){
        rest.badRequest(req,res,{ validation: ['File not received by the matrix']});
        return;
    }

    if(config.uploads.imgurKey !== undefined){
        uploadToImgur(req,res,file);
    }else{
        uploadTraditionally(req,res,file);
    }
}

function uploadToImgur(req, res, file){
    imgur.setKey(config.uploads.imgurKey);
    imgur.upload(file.path, function (data) {
        if (data.error) {
            throw data.error;
        }

        rest.end(res, {
            alt: file.name,
            url: data.links.original
        });
    });
}

function uploadTraditionally(req, res, file){
    var uploads = '/img/uploads/';

    async.waterfall([
        function(done){
            copyOver(file.path, path.join(config.static.folder, uploads), file.name, 1, done);
        },
        function(indexed, done){
            copyOver(file.path, path.join(config.static.bin, uploads), indexed, 1, done);
        }
    ], function(err, filename){
        rest.end(res, {
            alt: file.name,
            url: uploads + filename
        });
    });
}

function copyOver(source, folder, filename, index, done){
    var indexed, ext, target;
    if (index === 1){
        indexed = filename;
    }else{
        ext = path.extname(filename);
        indexed = path.basename(filename, ext) + '_' + index + ext;
    }

    target = path.join(folder, indexed);

    fs.exists(target, function(exists){
        if(exists){
            copyOver(source, folder, filename, ++index, done);
        }else{
            fse.copy(source,target, function(){
                done(null, indexed);
            });
        }
    });
}

module.exports = {
    upload: upload
};