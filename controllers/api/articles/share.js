'use strict';

var Article = require('../../../models/Article');
var articleService = require('../../../services/article');

module.exports = function (req, res, next) {
  var slug = req.params.slug;
  var medium = req.params.medium;

  Article.findOne({ slug: slug, status: 'published' }, found);

  function found (err, article) {
    if (err) {
      end('error', 'An unexpected error occurred.');
    } else if (!article) {
      end('error', 'The article can’t be shared.');
    } else {
      share(article);
    }
  }

  function share (article) {
    var channel = articleService.campaign[medium];
    if (channel) {
      channel(article, { reshare: true }, done);
    } else {
      end('error', 'Sharing medium "' + medium + '" is unknown.');
    }
    function done (err) {
      if (err) {
        end('error', 'Sharing via ' + medium + ' failed.');
      } else {
        end('success', 'Your article was shared via ' + medium + '.');
      }
    }
  }

  function end (type, message) {
    req.flash(type, message);
    res.redirect('/author/review');
  }
};
