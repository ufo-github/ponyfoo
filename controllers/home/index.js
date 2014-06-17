'use strict';

module.exports = function (req, res, next) {
  console.log(req.user);
  res.viewModel = {
    model: {
      articles: []
    }
  };
  next();
};
