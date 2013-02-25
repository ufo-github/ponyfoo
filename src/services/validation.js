var $ = require('./$.js'),
    rest = require('./rest.js');

function evaluateRule(opts){
    var rule = opts.rule;

    function failed(message){
        if (typeof message === 'string'){
            opts.messages.push(message);
        }
        return true;
    }

    if(opts.ignoreUndefined && opts.field === undefined){
        return false;
    }

    if (rule.validator){
        var result = rule.validator.apply(opts.field);
        if (typeof result === 'string'){
            return failed(result);
        }
    }
    if(!opts.field || opts.field.length < (rule.length || 1)){
        return failed(rule.message);
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
            rule: rule
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