!function (window,$,nbrut) {
    nbrut.tt.hook('deactivate', function(template){
        var layer = nbrut.thin;

        if(template.container !== nbrut.tt.defaults.container){
            layer = layer.thinner(template.container);
        }
        layer.abort();
    });

    nbrut.tt.hook('fill', function(container, template){
        container.hints(true);
    });
}(window,jQuery,nbrut);