'use strict';

function setup (app) {
  require('./old').setup(app);
  require('./shortlinks').setup(app);
}

module.exports = {
  setup: setup
};
