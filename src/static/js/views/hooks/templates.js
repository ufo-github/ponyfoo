!function (window,$,nbrut,undefined) {
    nbrut.tt.hook('deactivate', function(template){
        var layer = nbrut.thin;

        if(template.container !== nbrut.tt.defaults.container){
            layer = layer.thinner(template.container);
        }
        layer.abort();
    });

    // parse data-src in images
    nbrut.tt.hook('fill', function(container, template){
        container.loadImages();
    });

    // tooltip hints
    nbrut.tt.hook('fill', function(container, template){
        container.hints(true);
    });
}(window,jQuery,nbrut);