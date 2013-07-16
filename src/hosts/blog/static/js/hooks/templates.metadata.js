!function (window,$,nbrut,undefined) {
    'use strict';

    function getDescription(template, container, viewModel, settings){
        var viewMeta = viewModel.meta || {},
            descriptionTitle = viewMeta.title ? viewMeta.title.trim() + ' ' : '',
            descriptionLength = 160,
            descriptionElem = container.find('.meta-description:first'),
            descriptionElemText = descriptionElem.text(),
            descriptionText = descriptionElemText ? descriptionElemText : (viewMeta.description || ''),
            description, idx;

        if(!descriptionText && !descriptionTitle){ // use the default meta description
            return undefined;
        }
        description = (descriptionTitle + descriptionText).trim();

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
    nbrut.tt.hook('activated', function(template, container, viewModel, settings){
        var head, metaModel, meta, removables, selector;

        metaModel = {
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
            description: getDescription(template, container, viewModel, settings),
            keywords: container.find('[data-keywords]:first').data('keywords')
        };
        metaModel.images.push(window.locals.site.thumbnail);
        metaModel.firstImage = metaModel.images.splice(0,1);
        meta = nbrut.tt.partial('metadata', metaModel);

        // refresh micro data
        removables = [
            'meta[name=keywords]',
            'meta[property^="og:"]',
            'meta[name^="twitter:"]',
            'meta[itemprop]',
            'link[rel=canonical]'
        ];
        selector = removables.join(', ');
        
        head = $('head');
        head.find(selector).remove();
        meta.appendTo(head);
    });
}(window,jQuery,nbrut);