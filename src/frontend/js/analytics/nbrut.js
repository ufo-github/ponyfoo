!function(window, document){
    'use strict';

    var hooks = [];

    window.nbrut = window.nbrut || {};
    window.nbrut.analytics = {
        fetch: function(url){
            var tag = 'script',
                script = document.createElement(tag);

            script.async = true;
            script.src = url;

            var s = document.getElementsByTagName(tag)[0];
            s.parentNode.insertBefore(script, s);
        },
        onHistoryChange: function(fn){
            hooks.push(fn);
        },
        historyChange: function(data){
            var i, len = hooks.length;
            for(i = 0; i < len; i++){
                hooks[i](data);
            }
        }
    };
}(window, document);