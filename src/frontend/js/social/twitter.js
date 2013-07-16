!function(window, document, script){
    'use strict';

    var fjs = document.getElementsByTagName(script)[0];

    function insert(id, src){
        if (!document.getElementById(id)) {
            var js = document.createElement('script');
            js.async = true;
            js.id = id;
            js.src = src;
            fjs.parentNode.insertBefore(js, fjs);
        }
    }

    window.nbrut = window.nbrut || {};
    window.nbrut.social = window.nbrut.social || {};
    window.nbrut.social.twitter = {
        reload: function(){
            if (window.twttr){
                window.twttr.widgets.load();    
            }
            
        }
    };

    insert('twitter-wjs', '//platform.twitter.com/widgets.js');
}(window, document, 'script');