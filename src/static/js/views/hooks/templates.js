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
            container.fadeOutAndRemove();
            return false; // stop propagation
        });

        close.on('click.close', function(){
            container.trigger('container.close');
        });
    });
}(window,jQuery,nbrut);