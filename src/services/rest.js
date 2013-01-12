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

function error(res,code,err){
    var json = {
        error: {
            code: code,
            message: 'internal server error'
        }
    };

    $.log.err(err);

    head(res,code);
    end(res,json);
}

function resHandler(err, res, success){
    var test = !!err;
    if (test){
        error(res,500,err);
    }else{
        head(res,200);
        (success || res.end)();
    }
}

module.exports = {
    head: head,
    write: write,
    end: end,
    error: error,
    resHandler: resHandler
};