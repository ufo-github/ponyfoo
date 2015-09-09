'use strict';

var taunus = require('taunus');

function remodel (req, res) {
  taunus.rebuildDefaultViewModel(rebuilt);
  function rebuilt () {
    res.json({});
  }
}

module.exports = remodel;
