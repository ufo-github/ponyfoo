var rest = require('./rest.js');

function create(document, model, opts){
    var instance,
        callback = opts.then || function(err){
            rest.resHandler(err, res);
        };

    instance = new model(document);
    (opts.before || function(){})(instance);
    instance.save(callback);
}

module.exports = {
    create: create
};