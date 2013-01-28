var $ = require('./$.js');

function head(res,code) {
    res.writeHead(code, {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
    });
}

function encode(value){
    return JSON.stringify(value);
}

function write(res,value){
    var encoded = encode(value);
    res.write(encoded);
}

function end(res,value){
    var encoded = encode(value);
    res.end(encoded);
}

function error(res,code,message,err){
    var json = {
        error: {
            code: code,
            message: message || 'internal server error'
        }
    };

    $.log.err(err);

    head(res,code);
    end(res,json);
}

function resHandler(err, opts){
    var test = !!err;
    if (test){
        error(opts.res,500,undefined,err);
    }else{
        if(opts.writeHead !== false){
            head(opts.res,200);
        }
        if(!opts.then){
            end(opts.res,{});
        }else{
            opts.then.apply(null, opts.args);
        }
    }
}

module.exports = {
    head: head,
    write: write,
    end: end,
    error: error,
    resHandler: resHandler
};