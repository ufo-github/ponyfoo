!function(window, document, script){
    'use strict';

    var fjs = document.getElementsByTagName(script)[0];

    function insert(id, src){
        if (!document.getElementById(id)) {
            unsafeInsert(id, src);
        }
    }

    function unsafeInsert(id, src){
        var js = document.createElement('script');
        js.async = true;
        js.id = id;
        js.src = src;
        fjs.parentNode.insertBefore(js, fjs);
    }

    function load(fn){
        fn('pocket-btn-js', 'https://widgets.getpocket.com/v1/j/btn.js?v=1');    
    }
    
    window.nbrut = window.nbrut || {};
    window.nbrut.social = window.nbrut.social || {};
    window.nbrut.social.pocket = {
        reload: function(){
            load(unsafeInsert);
        }
    };

    load(insert);
}(window, document, 'script');