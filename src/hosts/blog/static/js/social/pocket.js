!function(nbrut){
    'use strict';

    function load(fn){
        fn('pocket-btn-js', 'https://widgets.getpocket.com/v1/j/btn.js?v=1');    
    }
    
    nbrut.social.pocket = {
        reload: function(){
            load(nbrut.social.insertUnchecked);
        }
    };

    load(nbrut.social.insert);
}(nbrut);