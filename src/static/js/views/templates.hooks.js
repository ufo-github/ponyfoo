!function (window,$,nbrut) {
    nbrut.tt.hook('deactivate', function(template){
        var layer = nbrut.thin;

        if(template.container !== nbrut.tt.defaults.container){
            layer = layer.thinner(template.container);
        }
        layer.abort();
    });

    nbrut.tt.hook('fill', function(container, template){
        container.find('img[data-src]').each(function(){
            var self = $(this),
                src = self.data('src');

            self.attr('src', src);
            self.removeAttr('data-src');
        });
    });

    nbrut.tt.hook('fill', function(container, template){
        container.hints(true);
    });
}(window,jQuery,nbrut);