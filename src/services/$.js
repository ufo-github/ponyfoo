var config = require('../config.js'),
    dev = config.env.development;

function logger(){
    var out = console;

    function log(level){
        function logLevel(message){
            if(!message){
                return;
            }

            if(dev){
                out.log(level);
                out.log(message);
            }
        }

        return logLevel;
    }

    return {
        err: log('ERROR')
    };
}

function args(o){
    return Array.prototype.slice.call(o);
}

module.exports = {
    noop: function(){},
    log: logger(),
    args: args
};