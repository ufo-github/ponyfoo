~function (window, document, location) {
  function inject (url) {
    var script = document.createElement('script');
    script.src = url;
    document.body.appendChild(script);
  }

  function injector () {
    inject('/js/all.js');
  }

  if (window.addEventListener) {
    window.addEventListener('load', injector, false);
  } else if (window.attachEvent) {
    window.attachEvent('onload', injector);
  } else {
    window.onload = injector;
  }
}(window, document, location);
