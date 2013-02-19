!function (window,$,nbrut,undefined) {
    nbrut.tt.hook('deactivate', function(template){
        var layer = nbrut.thin;

        if(template.container !== nbrut.tt.defaults.container){
            layer = layer.thinner(template.container);
        }
        layer.abort();
    });

    // parse data-src in images
    nbrut.tt.hook('fill', function(container){
        container.loadImages();
    });

    // tooltip hints
    nbrut.tt.hook('fill', function(container){
        container.hints(true);
    });

    // close buttons
    nbrut.tt.hook('fill', function (container){
        var close = container.find('.close');

        container.on('container.close', function(){
            var then = removeContentOverlay();

            container.fadeOutAndRemove(then);
            return false; // stop propagation
        });

        close.on('click.close', function(){
            container.trigger('container.close');
        });
    });

    // dialog display
    nbrut.tt.hook('fill', function(container){
        var dialog = container.is('.dialog');
        if (dialog){
            container.center().hide().fadeIn('fast', function(){
                container.find('[data-focus]').focus();
            });

            $('body').addClass('overlayed');
        }
    });

    function removeContentOverlay(){
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