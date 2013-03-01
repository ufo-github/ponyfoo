!function(Array) {
    Array.prototype.distinct = function() {
        var self = this,
            result = [];

        for (var i = 0; i < self.length; i++) {
            if (result.indexOf(self[i]) === -1) {
                result.push(self[i]);
            }
        }
        return result;
    };
}(Array);