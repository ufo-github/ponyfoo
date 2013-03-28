!function(window, $, undefined) {
    'use strict';

    var doc = $(document),
        nav = $('#top-navigation'),
        articles = $('.market-section'),
        first = articles.first(),
        last = articles.last(),
        prev = $('.prev'),
        next = $('.next'),
        disabled = 'disable-nav',
        me;

    function scrollNavigate(selector){
        var target = $(selector).attr('href');
        $(target).scrollIntoView();
        return false;
    }

    nav.on('click.navigate', 'a', function(){
        scrollNavigate(this);
    });

    $('a[href^=#]', articles).on('click', function(){
        scrollNavigate(this);
    });

    $(window).on('scroll.navigate', function(){
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
    }).trigger('scroll.navigate');

    prev.on('click.navigate', function(e){
        if(!prev.hasClass(disabled)){
            me.prev().scrollIntoView();
        }
    });

    next.on('click.navigate', function(){
        if(!next.hasClass(disabled)){
            me.next().scrollIntoView();
        }
    });

    function keydown(it, keyCodes){
        return function(e){
            if(keyCodes.indexOf(e.which) !== -1){
                it.trigger('click.navigate');
                return false;
            }
        };
    }

    doc.on('keydown.navigate', keydown(prev, [37,38]));
    doc.on('keydown.navigate', keydown(next, [39,40]));

    $('input').on('keydown.navigate', function(e){
        e.stopPropagation();
    });
}(window, jQuery);
