'use strict';

var winston = require('winston');
var sluggish = require('sluggish');
var moment = require('moment');
var Presentation = require('../../../models/Presentation');
var markupService = require('../../../services/markup');
var rparagraph = /^<p>|<\/p>$/ig;

module.exports = function (req, res) {
  var body = req.body;

  body.resources_title = Array.isArray(body['resources_title[]']) ?
     body['resources_title[]'] :
    [body['resources_title[]']];
  body.resources_url = Array.isArray(body['resources_url[]']) ?
     body['resources_url[]'] :
    [body['resources_url[]']];

  var model = {
    presented: moment(body.presented, 'DD-MM-YYYY').toDate(),
    title: body.title,
    slug: sluggish(body.slug),
    description: body.description,
    descriptionHtml: markupService.compile(body.description),
    youtube: body.youtube,
    vimeo: body.vimeo,
    speakerdeck: body.speakerdeck,
    resources: body.resources_title.map(toResourceItem)
  };
  new Presentation(model).save(saved);
  function toResourceItem (title, i) {
    return {
      title: title,
      titleHtml: markupService.compile(title).trim().replace(rparagraph, ''),
      url: body.resources_url[i]
    };
  }
  function saved (err) {
    if (err) {
      winston.error(err);
      res.redirect('/author/presentations/new');
    } else {
      res.redirect('/author/presentations');
    }
  }
};
