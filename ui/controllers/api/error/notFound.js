'use strict';

module.exports = function (req, res) {
  res.status(404).json({
    messages: [`API endpoint not found.`]
  });
};
