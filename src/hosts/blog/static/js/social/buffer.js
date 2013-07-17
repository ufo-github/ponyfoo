!function(window, nbrut){
    'use strict';

    function load(fn){
        fn('buffer-js', 'http://static.bufferapp.com/js/button.js');    
    }
    
    nbrut.social.buffer = {
        reload: function(){
            load(nbrut.social.insertUnchecked);
        }
    };

    load(nbrut.social.insert);
}(window, nbrut);