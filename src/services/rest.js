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

function error(res,code,message){
    var error = {
        error: {
            code: code,
                message: message
        }
    };

    head(res,code);
    write(res,error);
    res.end();
}

function resHandler(err, res, success){
    var test = !!err;
    if (test){
        rest.error(res,500,'internal server error');
    }else{
        rest.head(res,200);
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