'use strict';

var moment = require('moment');
var Engagement = require('../../../models/Engagement');

module.exports = function (req, res) {
  var body = req.body;
  var model = {
    start: moment(body.start, 'DD-MM-YYYY').toDate(),
    end: moment(body.end, 'DD-MM-YYYY').toDate(),
    conference: body.conference,
    website: toUrl(body.website),
    venue: body.venue,
    location: body.location,
    tags: body.tags.toLowerCase().split(' ')
  };
  new Engagement(model).save(saved);
  function toUrl (href) {
    return /https?:\/\//i.test(href) ? href : 'http://' + href;
  }
  function saved (err) {
    if (err) {
      winston.error(err);
      res.redirect('/author/engagements/new');
    } else {
      res.redirect('/author/engagements');
    }
  }
};
