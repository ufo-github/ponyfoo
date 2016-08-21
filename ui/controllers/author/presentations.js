'use strict';

const datetimeService = require(`../../services/datetime`);
const Presentation = require(`../../models/Presentation`);

module.exports = function (req, res, next) {
  Presentation.find({}).sort(`-presented`).lean().exec(function (err, presentations) {
    if (err) {
      next(err); return;
    }
    res.viewModel = {
      model: {
        title: `Presentations \u2014 Pony Foo`,
        presentations: presentations.map(function (presentation) {
          return {
            id: presentation._id.toString(),
            presented: datetimeService.field(presentation.presented),
            title: presentation.title
          };
        })
      }
    };
    next();
  });
};
