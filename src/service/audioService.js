'use strict';

module.exports = {
    beep: function(){
        process.stdout.write('\u0007'); // system beep
    }
};