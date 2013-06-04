'use strict';

module.exports = {
    beep: function(){
        process.stderr.write('\u0007'); // system beep
    }
};