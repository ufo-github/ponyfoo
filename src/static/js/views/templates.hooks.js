!function (window,$,nbrut) {
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

    // markdown and markdown editors
    nbrut.tt.hook('fill', function(container, template){
        var prefix = 'wmd-input',
            inputs = container.find('.wmd-input');

        inputs.each(function(){
            var id = this.id, p = id.indexOf(prefix), postfix;

            if(p !== 0){
                throw new Error('invalid markdown editor id: "{0}"'.format(id));
            }

            postfix = id.substr(prefix.length);
            nbrut.md.runEditor(postfix);
        });

        var md = container.find('.markdown');
        nbrut.md.prettify(md);
    });
}(window,jQuery,nbrut);