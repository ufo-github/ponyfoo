~function (window, document, localStorage) {
  var head = document.getElementsByTagName('head')[0];
  var lsdata = 'fonts';
  var lsurl = lsdata + '_url';
  var url = '/css/fonts.css';

  load();

  function load () {
    if (localStorage && localStorage[lsdata] && localStorage[lsurl] == url) {
      use(localStorage[lsdata]);
    }
    if (localStorage && XMLHttpRequest) {
      request();
    } else if (document.cookie.indexOf(url) == 0) {
      tag();
    } else {
      on(window, 'load', tag);
    }
  }

  function request () {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    on(xhr, 'load', ready);
    xhr.send();
    function ready () {
      if (xhr.readyState == 4) {
        use(xhr.responseText);
        localStorage[lsdata] = xhr.responseText;
        localStorage[lsurl] = url;
      }
    }
  }

  function tag () {
    var elem = document.createElement('link');
    elem.href = url;
    elem.rel = 'stylesheet';
    elem.type = 'text/css';
    head.appendChild(elem);
    document.cookie = url;
  }

  function use (data) {
    var elem = document.createElement('style');
    elem.innerHTML = data;
    head.appendChild(elem);
  }

  function on (target, type, fn) {
    if (target.addEventListener) {
      target.addEventListener(type, fn, false);
    } else if (target.attachEvent) {
      target.attachEvent('on' + type, fn);
    } else {
      target['on' + type] = fn;
    }
  }
}(window, document, localStorage);
