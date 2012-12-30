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
        return this.attr('target','_blank').each(function(){
            var a = $(this),
                url = a.get(0).href;

            if(url.indexOf(document.location.origin) !== 0){
                a.attr('rel','nofollow');
            }
        });
    }
}(jQuery);