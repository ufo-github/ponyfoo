!function(window, $, undefined) {
    'use strict';

    var nav = $('#top-navigation'),
        articles = $('.market-section');

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
            }),
            cssClass = viewing.first().data('nav'),
            color = $(cssClass, nav).css('borderTopColor');

        nav.css('backgroundColor', color);
    });
}(window, jQuery);
