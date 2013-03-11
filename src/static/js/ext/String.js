!function(String) {
    'use strict';

    String.prototype.format = function() {
        var args = arguments;
        return this.replace( /\{\{|\}\}|\{(\d+)\}/g , function(m, n) {
            if (m == "{{") {
                return "{";
            }
            if (m == "}}") {
                return "}";
            }
            return args[n];
        });
    };

    String.prototype.trimReduce = function() {
        return this.trim().replace(/\s{2,}/g, ' ');
    };
}(String);