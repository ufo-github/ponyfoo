!function (window,$,nbrut,undefined) {
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
            description: getDescription(container),
            keywords: container.find('[data-keywords]:first').data('keywords')
        };
        ogModel.images.push(nbrut.site.thumbnail);
        ogModel.firstImage = ogModel.images.slice(0,1);
        og = nbrut.tt.partial('metadata', ogModel);

        // refresh micro data
        head.find('meta[name=keywords], meta[name=description], meta[property^="og:"], meta[itemprop]').remove();
        og.appendTo(head);
    });
}(window,jQuery,nbrut);