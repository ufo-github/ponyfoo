~function (document) {
  var elem = document.createElement('link');
  var head = document.getElementsByTagName('head')[0];
  elem.rel = 'stylesheet';
  elem.href = '/css/all.css';
  elem.media = 'only x';
  head.appendChild(elem);
  setTimeout(function () {
    elem.media = 'all';
  });
}(document);
