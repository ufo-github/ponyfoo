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

    function getDescription(container){
        var descriptionLength = 160,
            descriptionElem = container.find('.og-description:first'),
            description, idx;

        if (descriptionElem.length === 0){ // let the template use it's default value
            return undefined;
        }
        description = descriptionElem.text().trim();

        if (description.length > descriptionLength){
            description = description.substr(0, descriptionLength);
            idx = description.lastIndexOf(' ');

            if(idx !== -1){ // truncate the last word, which might have been trimmed
                description = description.substr(0, idx);
            }

            description += ' [...]';
        }
        return description;
    }

    // open graph micro data (mostly for feeding our zombie-crawler)
    nbrut.tt.hook('activated', function(container, template, viewModel, settings){
        var head = $('head'), ogModel, og;

        ogModel = {
            title: viewModel.title,
            url: window.location.href,
            images: container.find('img').map(function(){
                var image = $(this),
                    width = image.width(),
                    height = image.height(),
                    high = Math.max(width, height),
                    low = Math.min(width, height),
                    src;

                if (width + height >= 650 || (width + height >= 250 && high / low > 0.3)){
                    return image.prop('src');
                }
            }).get(),
            description: getDescription(container)
        };
        og = nbrut.tt.partial('opengraph', ogModel);

        // refresh micro data
        head.find('meta[property^="og:"]').remove();
        og.appendTo(head);
    });
}(window,jQuery,nbrut);