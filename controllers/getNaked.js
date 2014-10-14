'use strict';

module.exports = function (req, res, next) {
  if (req.hostname === 'blog.ponyfoo.com') {
    res.redirect('http://ponyfoo.com/' + req.url, 301);
  } else {
    next();
  }
};
