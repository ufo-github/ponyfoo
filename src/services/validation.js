var $ = require('./$.js'),
    rest = require('./rest.js');

function evaluateRule(opts){
    if(opts.ignoreUndefined && opts.field === undefined){
        return false;
    }

    if(!opts.field || opts.field.length < (opts.length || 1)){
        if (typeof opts.message === 'string'){
            opts.messages.push(opts.message);
        }
        return true;
    }
    return false;
}

function applyRule(ctx, rule){
    if('all' in rule){
        var sub = rule.all,
            failed = sub.rules.some(function(child){
                return applyRule(ctx, child);
            });

        if(failed){
            if(typeof sub.message === 'string'){
                ctx.messages.push(sub.message);
            }
        }
        return failed;
    }else{
        return evaluateRule({
            messages: ctx.messages,
            ignoreUndefined: ctx.opts.ignoreUndefined,
            field: $.findProperty(ctx.opts.document, rule.field),
            length: rule.length,
            message: rule.message
        });
    }
}

function validate(req,res,opts){
    var messages = [],
        invalid;

    (opts.rules || []).forEach(function(rule){
        var failed = applyRule({
            messages: messages,
            opts: opts
        }, rule);

        if(failed){
            invalid = true;
        }
    });

    if(invalid){
        if(!messages.length){
            messages.push('Invalid input');
        }
        rest.badRequest(req, res, { validation: messages });
        return undefined;
    }
    return opts.document;
}

module.exports = {
    validate: validate
};