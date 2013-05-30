'use strict';

var config = require('../config'),
    mustacheService = require('./mustacheService.js'),
    path = require('path'),
    fs = require('fs'),
    base = '/email';

function renderTemplate(templateName, message, done){
    var key = path.join(base, templateName +'.mu');
    mustacheService.render(key, message, done);
}

module.exports = {
    render: function(templateName, model, done){
        renderTemplate(templateName, model, function(err, html){
            if(err){
                return done(err);
            }

            var message = {
                subject: model.subject,
                header: {
                    intro: model.intro,
                    image: {
                        alt: config.site.name
                    }
                },
                body: html,
                footer: {
                    twitter: config.contact.twitter,
                    landing: {
                        url: config.server.authorityLanding,
                        title: config.site.name
                    }
                }
            };
            renderTemplate('layout', message, done);
        });
    }
};