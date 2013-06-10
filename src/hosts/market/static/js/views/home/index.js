!function (document, script, id){
    'use strict';

    var js, fjs = document.getElementsByTagName(script)[0],
        p = /^http:/.test(document.location) ? 'http' : 'https';

    if (!document.getElementById(id)) {
        js = document.createElement(script);
        js.id = id;
        js.src = p + '://platform.twitter.com/widgets.js';
        fjs.parentNode.insertBefore(js, fjs);
    }
}(document, 'script', 'twitter-wjs');