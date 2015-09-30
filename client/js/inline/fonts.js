~function (document) {
  var elem = document.createElement('link');
  var head = document.getElementsByTagName('head')[0];
  elem.id = '_fonts'
  elem.rel = 'stylesheet';
  elem.href = 'http://fonts.googleapis.com/css?family=Neuton:700|Merriweather:400italic,400,700';
  elem.media = 'only x';
  head.appendChild(elem);
  setTimeout(function () {
    elem.media = 'all';
  });
}(document);
