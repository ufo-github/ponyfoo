'use strict';

const winston = require('winston');
const sluggish = require('sluggish');
const moment = require('moment');
const Presentation = require('../../../models/Presentation');
const markupService = require('../../../services/markup');

module.exports = function (req, res) {
  const body = req.body;

  body.resources_title = Array.isArray(body['resources_title[]']) ?
     body['resources_title[]'] :
    [body['resources_title[]']];
  body.resources_url = Array.isArray(body['resources_url[]']) ?
     body['resources_url[]'] :
    [body['resources_url[]']];

  const model = {
    presented: moment.utc(body.presented, 'DD-MM-YYYY').toDate(),
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
    const rparagraph = /^<p>|<\/p>$/ig;
    return {
      title: title,
      titleHtml: markupService.compile(title).trim().replace(rparagraph, ''),
      url: body.resources_url[i]
    };
  }
  function saved (err) {
    if (err) {
      winston.error(err);
      res.redirect('/presentations/new');
    } else {
      res.redirect('/presentations/review');
    }
  }
};
