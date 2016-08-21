'use strict';

function redirect (res, next) {
  return function (err, documents) {
    if (err) {
      next(err);
    } else if (!documents || !documents.length) {
      next(`route`);
    } else {
      res.redirect(`/weekly/` + documents[0].slug);
    }
  };
}

module.exports = redirect;
