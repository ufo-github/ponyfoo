!function (window,$,nbrut,undefined) {
    'use strict';

    var tt = nbrut.tt;

    // abort thin requests
    tt.hook('deactivate', function(template){
        var layer = nbrut.thin;

        if(template.container !== tt.defaults.container){
            layer = layer.thinner(template.container);
        }
        layer.abort();
    });

    // hash auto-scrolling
    tt.hook('fill', function(container, viewModel, data){
        if(data.hash !== undefined){
            var autoscroll = data.hash + '[data-hash-autoscroll]',
                element = container.find(autoscroll);

            element.scrollIntoView();
        }
    });

    // parse data-src in images
    tt.hook('fill', function(container){
        container.loadImages();
    });

    // tooltip hints
    tt.hook('fill', function(container){
        container.hints(true);
    });

    // close buttons
    tt.hook('fill', function (container){
        var close = container.find('.close');

        container.on('container.close', function(){
            var then = removeContentOverlay(container);

            container.fadeOutAndRemove(then);
            return false; // stop propagation
        });

        close.on('click.close', function(){
            container.trigger('container.close');
        });
    });

    // dialog focus and overlay
    tt.hook('fill', function(container){
        var dialog = container.is('.dialog');
        if (dialog){
            container.center().hide().fadeIn('fast', function(){
                container.find('[data-focus]').focus();
            });

            $('body').addClass('overlayed');
        }
    });

    function removeContentOverlay(container){
        if(container.is('.dialog')){
            return function(){
                var body = $('body');
                if (body.find('.dialog').length === 0){
                    body.removeClass('overlayed');
                }
            };
        }
        return $.noop;
    }
}(window,jQuery,nbrut);