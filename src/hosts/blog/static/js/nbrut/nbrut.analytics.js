!function(window,$,nbrut){
    'use strict';

    var hooks = [];

    nbrut.analytics = {
        fetch: function(url){
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.async = true;
            script.src = url;

            var s = document.getElementsByTagName('script')[0];
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
}(window,jQuery,nbrut);