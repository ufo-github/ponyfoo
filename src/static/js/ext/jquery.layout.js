!function(window, $, undefined) {
    'use strict';

    var fn = $.fn;
    
    fn.inView = function(){
        return this.is(function(){
            var rect = this.getBoundingClientRect();

            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= window.innerHeight &&
                rect.right <= window.innerWidth
            );
        });
    };

    fn.scrollIntoView = function(then) {
        var self = $(this);
        if (self.length > 0 && !self.inView()){
            $('body').animate({
                scrollTop: self.position().top - 30
            }, 'fast', then);
        }else if(then){
            then.call(self);
        }

        return this;
    };

    fn.center = function () {
        return this.each(function() {
            var self = $(this),
                win = $(window);

            self.css('top', Math.max(0, ((win.height() - self.outerHeight()) / 2) + win.scrollTop()) + 'px');
            self.css('left', Math.max(0, ((win.width() - self.outerWidth()) / 2) + win.scrollLeft()) + 'px');
        });
    };

    function textDimension(property){
        return function(){
            var self = $(this),
                calculator = $('<span style="display: inline-block;">'),
                wrapper,
                dimension;

            self.wrapInner(calculator);
            wrapper = self.children();
            dimension = wrapper[property]();
            wrapper.contents().unwrap();
            return dimension;
        };
    }

    fn.textWidth = textDimension('outerWidth');
    fn.textHeight = textDimension('outerHeight');

    fn.centerTextOnParent = function(){
        var self = $(this),
            parent = self.parent(),
            width = parent.width(),
            height = parent.height(),
            textWidth = self.textWidth(),
            textHeight = self.textHeight(),
            top = (height - textHeight) / 2,
            left = (width - textWidth) / 2;

        return self.css({
            marginTop: top + 'px',
            marginLeft: left + 'px',
            marginBottom: -top + 'px',
            marginRight: -left + 'px'
        });
    };

    fn.clearInlineMargins = function(){
        return this.css({
            marginTop: '',
            marginLeft: '',
            marginBottom: '',
            marginRight: ''
        });
    };
}(window, jQuery);