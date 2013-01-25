!function($) {
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

    $.fn.anchorSEO = function(){
        return this.each(function(){
            var a = $(this),
                url = a.get(0).href;

            if(url.indexOf(document.location.origin) !== 0){
                a.attr('rel','nofollow');
            }
        });
    };

    function doThisAndRemove(effect, then) {
        return this.each(function() {
            var self = $(this);
            self[effect]("fast", function() {
                self.remove();
                (then || $.noop)();
            });
        });
    }

	$.fn.fadeOutAndRemove = function(then) {
        doThisAndRemove.apply(this, ['fadeOut',then]);
	};

    $.fn.slideUpAndRemove = function(then) {
        doThisAndRemove.apply(this, ['slideUp',then]);
    };
}(jQuery);