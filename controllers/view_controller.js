'use strict';

var path = require('path');
var blender = require('blender');
var base = path.resolve(__dirname, '../blender');
var blend = blender(base);

module.exports = {
  getView: function (req, res, next) {
    blend(req.url, function (err, partial) {
      if (err) {
        next(); return;
      }
// figure out how to load non-partial stuff on server-side only.
      var model = {
        view: {
          title: '',
          description: '',
          canonical: '',
          keywords: '',
          author: {
            meta: '',
            twitter: ''
          },
          images: {
            cover: '',
            list: []
          }
        },
        site: {
          title: ''
        },
        partial: partial
      };

      res.render('__layout', model);
    });
  }
};
