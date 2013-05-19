!function(window, $, undefined) {
    'use strict';

    var fn = $.fn;

    fn.anchorSEO = function(selector){
        var container = this;

        container.find(selector || 'a').each(function(){
            var a = $(this),
                url = a.get(0).href,
                title = a.attr('title');

            a.addClass('highlighted-link');

            if(!!title){
                a.attr('data-hint', title);
                a.removeAttr('title');
            }

            if(url.indexOf(document.location.origin) !== 0){
                a.attr('rel','nofollow');
            }
        });

        return container.hints(true);
    };

    fn.loadImages = function(){
        return this.find('img[data-src]').each(function(){
            var self = $(this),
                src = self.data('src');

            self.attr('src', src);
            self.removeAttr('data-src');
        });
    };
}(window, jQuery);