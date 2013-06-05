'use strict';

var config = require('../config'),
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

function sendEmail(template, model, done){
    if(!model.to){ return done(new Error('required email recipient missing')); }
    if(!model.subject){ return done(new Error('required email subject missing')); }
    if(!model.intro){ return done(new Error('required email introduction missing')); }

    getImageHeader(function(err, header){
        if(err){
            return done(err);
        }

        if(config.email.trap){
            model.subject += ' - to: ' + model.to;
            model.to = config.email.trap;
        }

        emailTemplateService.render(template, model, function(err, html){
            if(err){
                return done(err);
            }

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

            client.messages.send(emailModel, function(response){
                done(null, response);
            }, function(err){
                done(err);
            });
        });
    });
}

module.exports = {
    send: sendEmail
};