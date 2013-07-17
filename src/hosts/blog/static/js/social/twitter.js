!function(window, nbrut){
    'use strict';

    nbrut.social.insert('twitter-wjs', '//platform.twitter.com/widgets.js');
    nbrut.social.twitter = {
        reload: function(){
            if (window.twttr){
                window.twttr.widgets.load();    
            }
            
        }
    };
}(window, nbrut);