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
    });

    function evaluate(timeout){
        var slug = input.val();
        if (query !== slug){
            query = slug;

            if(key){
                clearTimeout(key);
            }
            if (xhr){
                xhr.abort();
            }

            if(slug.length){
                if(timeout === true){
                    key = setTimeout(request, 300);
                }else{
                    request();
                }
            }else{
                buttonText.empty();
                toggleEnabled(false);
            }
        }
    }

    function request(){
        status.attr('class', statusCss); // default styles
        status.addClass('loading');

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
                    buttonText.html('<b>{0}</b> is illegal.'.format(query));
                    break;

                case 'taken':
                    status.addClass('market taken');
                    buttonText.html('<b>{0}</b> is taken.'.format(query));
                    break;

                case 'available':
                    status.addClass('market available');
                    buttonText.html('<b>{0}</b> can be yours'.format(query));
                    break;
            }

            toggleEnabled(available);
        });
    }

    function toggleEnabled(available){
        button.prop('disabled', !available);
        button.data('slug', available ? query : null);
    }

    evaluate(true);
}(window, jQuery);
