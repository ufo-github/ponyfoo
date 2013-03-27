!function(window, $, undefined) {
    'use strict';

    var nav = $('#top-navigation'),
        articles = $('.market-section'),
        first = articles.first(),
        last = articles.last(),
        prev = $('.prev'),
        next = $('.next'),
        disabled = 'disable-nav',
        me;

    nav.on('click', 'a', function(){
        var target = $(this).attr('href');
        $(target).scrollIntoView();
        return false;
    });

    $(window).on('scroll', function(){
        var viewing = articles.filter(function(){
            return $(this).is(function(){
                var rect = this.getBoundingClientRect();
                return rect.top >= 0 || rect.bottom >= 50;
            });
        }), cssClass, color;

        me = viewing.first();
        cssClass = me.data('nav');
        color = $(cssClass, nav).css('borderTopColor');

        nav.css('backgroundColor', color);

        prev.toggleClass(disabled, me.is(first));
        next.toggleClass(disabled, me.is(last));
    }).trigger('scroll');

    prev.on('click', function(){
        if(!prev.hasClass(disabled)){
            me.prev().scrollIntoView();
        }
    });

    next.on('click', function(){
        if(!next.hasClass(disabled)){
            me.next().scrollIntoView();
        }
    });
}(window, jQuery);
