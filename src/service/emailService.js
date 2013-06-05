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

function prepareEmailJson(template, model, done){
    async.waterfall([
        function(next){
            getImageHeader(next);
        },
        function(header, next){
            if(config.email.trap){
                model.subject += ' - to: ' + model.to;
                model.to = config.email.trap;
            }
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
                    to: typeof model.to === 'string' ? [{
                        email: model.to
                    }] : model.to,
                    auto_text: true,
                    inline_css: true,
                    preserve_recipients: false,
                    tags: model.tags ? model.tags : [template],
                    images: [{
                        type: 'image/png',
                        name: 'header',
                        content: header
                    }]
                }
            };

            next(null, emailModel);
        },
        function(emailModel, next){
            if(model.merge){
                emailModel.message.merge = true;
                emailModel.global_merge_vars = mapMergeHash(model.merge.globals);
                emailModel.merge_vars = mapMergeLocals(model.merge.locals);
            }

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