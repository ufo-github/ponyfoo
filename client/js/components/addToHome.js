'use strict';

const scroll = require(`../lib/scroll`);
const interval = 1000;

function addToHome () {
  let ready = false;
  const destroy = scroll.track(readyAfterScroll);

  window.addEventListener(`beforeinstallprompt`, controlledAddToHome);

  function controlledAddToHome (e) {
    if (ready) {
      return;
    }
    e.preventDefault();
    setTimeout(() => e.prompt(), interval);
  }

  function readyAfterScroll ({ scrolled }) {
    if (scrolled < 60) {
      return;
    }
    ready = true;
    destroy();
  }
}

module.exports = addToHome;
