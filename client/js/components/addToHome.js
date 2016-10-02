'use strict';

const interval = 1000;
let ready = false;

function setup () {
  window.addEventListener(`beforeinstallprompt`, controlledAddToHome);
}

function controlledAddToHome (e) {
  if (ready) {
    return;
  }
  e.preventDefault();
  setTimeout(() => e.prompt(), interval);
}

function enable () {
  ready = true;
}

module.exports = {
  setup, enable
};
