!function (window,$,nbrut,undefined) {
    // abort thin requests
    nbrut.tt.hook('deactivate', function(template){
        var layer = nbrut.thin;

        if(template.container !== nbrut.tt.defaults.container){
            layer = layer.thinner(template.container);
        }
        layer.abort();
    });

    // scroll to hash
    nbrut.tt.hook('fill', function(container, viewModel, data){
        if(data.hash !== undefined){
            var filter = '[data-hash-autoscroll][data-hash={0}]',
                hash = data.hash.substr(1),
                selector = filter.format(hash),
                element = container.find(selector);

            element.scrollIntoView();
        }
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
            var then = removeContentOverlay(container);

            container.fadeOutAndRemove(then);
            return false; // stop propagation
        });

        close.on('click.close', function(){
            container.trigger('container.close');
        });
    });

    // dialog focus and overlay
    nbrut.tt.hook('fill', function(container){
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