!function(window, $, undefined) {
    'use strict';

    var section = $('.availability-input'),
        input = section.find('.identifier'),
        status = section.find('.availability'),
        statusCss = status.attr('class'),
        key, xhr, query;

    input.on('keydown', function(){
        setTimeout(evaluate, 0);
    });

    function evaluate(){
        var slug = input.val();
        if (slug.length > 3 && query !== slug){
            query = slug;

            if(key){
                clearTimeout(key);
            }
            key = setTimeout(request, 300);
        }
    }

    function request(){
        if (xhr){
            xhr.abort();
        }
        
        status.attr('class', statusCss); // default styles
        xhr = $.ajax({
            method: 'POST',
            url: '/api/1.0/blog/availability',
            data: { slug: query }
        }).always(function(){
            status.removeClass('loading');
        }).done(function(){
            status.addClass('market available');
        }).fail(function(){
            status.addClass('market forbidden');
        });

        status.addClass('loading');
    }
}(window, jQuery);
