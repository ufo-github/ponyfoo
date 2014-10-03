~function(window, document) {
  function inject () {
    var elem = document.createElement('script');
    elem.src = '/js/all.js';
    document.body.appendChild(elem);
  }

  if (window.addEventListener) {
    window.addEventListener('load', inject, false);
  } else if (window.attachEvent) {
    window.attachEvent('onload', inject);
  } else {
    window.onload = inject;
  }
}(window, document);
