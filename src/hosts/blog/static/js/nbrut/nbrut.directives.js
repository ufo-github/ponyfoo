!function(nbrut){
    'use strict';

    var store = [];

    nbrut.directives = function(key, value){
        if(key in store){
            return store[key];
        }
        store[key] = value;
        return value;
    };
}(nbrut);