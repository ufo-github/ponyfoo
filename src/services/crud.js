var $ = require('./$.js'),
    rest = require('./rest.js');

function getCallback(opts){
    if(!!opts && !!opts.res){
        return function(err){
            opts.args = $.args(arguments).slice(1);
            rest.resHandler(err, opts);
        }
    }
    return $.log.err;
}

function crud(model){
    function create(source, opts){
        var document,
            callback = getCallback(opts);

        document = new model(source);
        (opts.always || $.noop)(document);
        document.save(callback);
    }

    function update(query, document, opts){
        var callback = getCallback(opts);

        (opts.always || $.noop)(document);
        model.findOneAndUpdate(query, document, {}, callback);
    }

    function remove(query, opts){
        var callback = getCallback(opts);

        model.remove(query, callback);
    }

    return {
        create: create,
        update: update,
        remove: remove
    }
}

module.exports = crud;