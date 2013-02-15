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

    // open graph micro data (mostly for feeding our zombie-crawler)
    nbrut.tt.hook('activated', function(template, viewModel, settings){
        var head = $('head'),
            ogModel = {
                title: viewModel.title,
                url: window.location.href,
                images: [
                    // TODO: images + pony foo
                ],
                description: 'foo bar' // TODO appropriate description
            },
            og = nbrut.tt.partial('opengraph', ogModel);

        head.find('meta[property^="og:"]').remove(); // remove existing micro data
        og.appendTo(head);

        console.log(template);
        console.log(viewModel);
        console.log(settings);
        console.log(ogModel);
    });
}(window,jQuery,nbrut);