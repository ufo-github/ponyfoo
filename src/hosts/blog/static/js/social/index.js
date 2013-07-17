!function(document, nbrut, script){
    'use strict';

    var fjs = document.getElementsByTagName(script)[0];

    function insert(id, src){
        if (!document.getElementById(id)) {
            insertUnchecked(id, src);
        }
    }

    function insertUnchecked(id, src){
        var js = document.createElement(script);
        js.async = true;
        js.id = id;
        js.src = src;
        fjs.parentNode.insertBefore(js, fjs);
    }

    nbrut.social = {
        insert: insert,
        insertUnchecked: insertUnchecked
    };
}(document, nbrut, 'script');