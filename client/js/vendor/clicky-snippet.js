~function (document, tag) {
  var pull = document.createElement(tag);
  var prior = document.getElementsByTagName(tag)[0];
  pull.async = 1;
  pull.src = '//static.getclicky.com/js';
  prior.parentNode.insertBefore(pull, prior);
}(document, 'script');
