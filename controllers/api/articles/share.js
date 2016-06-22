'use strict';

var Article = require('../../../models/Article');
var articleSharingService = require('../../../services/articleSharing');

module.exports = function (req, res, next) {
  var slug = req.params.slug;
  var medium = req.params.medium;

  Article
    .findOne({ slug: slug })
    .populate('author')
    .exec(found);

  function found (err, article) {
    if (err) {
      end('error', 'An unexpected error occurred.');
    } else if (!article) {
      end('error', 'Article not found.');
    } else if (article.status !== 'published' && medium !== 'email-self') {
      end('error', 'The article can’t be shared.');
    } else {
      share(article);
    }
  }

  function share (article) {
    var channel = articleSharingService[medium];
    if (channel) {
      channel(article, { reshare: true, userId: req.user }, done);
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
    res.redirect('/articles/review');
  }
};
