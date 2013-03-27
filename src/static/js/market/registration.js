!function(window, $, undefined) {
    'use strict';

    var section = $('.availability-input'),
        input = section.find('.identifier'),
        status = section.find('.availability'),
        statusCss = status.attr('class'),
        key, xhr, query,
        button = $('.proceed'),
        buttonText = button.find('.proceed-tip');

    input.on('keydown', function(){
        setTimeout(evaluate, 0);
    }).trigger('keydown');

    function evaluate(){
        var slug = input.val();
        if (slug.length > 3 && query !== slug){
            query = slug;

            if(key){
                clearTimeout(key);
            }
            if (xhr){
                xhr.abort();
            }
            key = setTimeout(request, 300);
        }
    }

    function request(){
        status.attr('class', statusCss); // default styles
        xhr = $.ajax({
            url: '/api/1.0/blog/market',
            type: 'POST',
            data: JSON.stringify({ slug: query }),
            dataType: 'json',
            contentType: 'application/json; charset=utf-8'
        }).always(function(){
            status.removeClass('loading');
        }).done(function(data){
            var available = data.status === 'available';

            switch(data.status){
                case 'forbidden':
                    status.addClass('market forbidden');
                    break;

                case 'taken':
                    status.addClass('market taken');
                    break;

                case 'available':
                    status.addClass('market available');
                    break;
            }

            button.prop('disabled', !available);
            button.data('slug', available ? query : null);
            buttonText.html(available ? '<b>{0}</b> can be yours!'.format(query) : '');
        });

        status.addClass('loading');
    }
}(window, jQuery);
