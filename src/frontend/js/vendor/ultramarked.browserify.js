!function(window){
    'use strict';
    
    window.ultramarked = require('ultramarked');
    window.ultramarked.setOptions({
        breaks: true,
        smartLists: true,
        ultralight: true,
        ultrasanitize: true
    });
}(window);