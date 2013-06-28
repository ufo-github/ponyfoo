'use strict';

var config = require('../config'),
    async = require('async'),
    path = require('path'),
    fsService = require('./fsService.js'),
    emailTemplateService = require('./emailTemplateService.js'),
    Mandrill = require('mandrill-api').Mandrill,
    client = new Mandrill(config.email.apiKey, config.email.debug),
    getImageHeader;

if(!config.email.apiKey){
    console.log('WARN: email api key not set');
}

(function(){
    var cached;

    getImageHeader = function(done){
        if(cached){
            return process.nextTick(function(){
                done(null, cached);
            });
        }

        var file = path.join(process.cwd(), '/templates/email/img/header.png');

        fsService.readBase64(file, function(err, base64){
            if(err){
                return done(err);
            }
            cached = base64;
            done(null, cached);
        });
    };
})();

function fixRecipients(model){
    model.to = typeof model.to === 'string' ? [{
        email: model.to
    }] : model.to || [];
}

function getRecipientsTitle(recipients){
    if(!recipients.length){
        return 'nobody!';
    }
    if(recipients.length === 1){
        return recipients[0].email;
    }
    return recipients.length + ' recipients';
}

function prepareEmailJson(template, model, done){
    fixRecipients(model);

    if(config.email.trap){
        model.subject += ' - to: ' + getRecipientsTitle(model.to);
        model.trapped = JSON.stringify({
            to: model.to || [],
            merge: model.merge || []
        }, null, 2);
        model.to = [{ email: config.email.trap }];
    }

    async.waterfall([
        function(next){
            getImageHeader(next);
        },
        function(header, next){
            emailTemplateService.render(template, model, function(err, html){
                next(err, html, header);
            });
        },
        function(html, header, next){
            var emailModel = {
                message: {
                    html: html,
                    subject: model.subject,
                    from_email: config.email.sender,
                    from_name: config.site.name,
                    to: model.to,
                    auto_text: true,
                    inline_css: true,
                    preserve_recipients: false,
                    tags: model.tags ? model.tags : [template],
                    images: [{
                        name: 'header',
                        type: 'image/png',
                        content: header
                    }].concat(model.images || [])
                }
            };

            next(null, emailModel);
        },
        function(emailModel, next){
            if(!model.merge){
                model.merge = {};
            }

            emailModel.message.merge_vars = mapMergeLocals(model.merge.locals);
            emailModel.message.global_merge_vars = mapMergeHash(model.merge.globals);
            emailModel.message.global_merge_vars.push({
                name: 'unsubscribe_html', content: '' // default
            });

            next(null, emailModel);
        }
    ], done);
}

function mapMergeHash(hash){
    var result = [], key;

    for(key in hash || {}){
        result.push({
            name: key,
            content: hash[key]
        });
    }
    return result;
}

function mapMergeLocals(hash){
    var result = [], key, local;

    for(key in hash || {}){
        local = hash[key];
        result.push({
            rcpt: local.email,
            vars: mapMergeHash(local.model)
        });
    }
    return result;
}

function sendEmail(template, model, done){
    if(!model.to){ return done(new Error('required email recipient missing')); }
    if(!model.subject){ return done(new Error('required email subject missing')); }
    if(!model.intro){ return done(new Error('required email introduction missing')); }

    prepareEmailJson(template, model, function(err, emailModel){
        if(err){
            return done(err);
        }

        client.messages.send(emailModel, function(response){
            done(null, response);
        }, function(err){
            done(err);
        });
    });
}

module.exports = {
    send: sendEmail
};