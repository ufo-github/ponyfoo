'use strict';

module.exports = function (req, res, next) {
  if (req.hostname === 'blog.ponyfoo.com') {
    res.redirect('http://ponyfoo.com/' + req.url);
  } else {
    next();
  }
};
