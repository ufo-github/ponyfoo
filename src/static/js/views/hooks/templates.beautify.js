!function (window,$,nbrut,undefined) {
    // external links
    nbrut.tt.hook('fill', function(container){
        var external = container.find('a[rel=nofollow]'),
            hostnames = $.makeArray(external.map(function(){ return this.hostname })),
            yandex = 'http://favicon.yandex.net/favicon/{0}',
            sprite = yandex.format(hostnames.distinct().join('/'));

        external.each(function(){
            var self = this,
                index = hostnames.indexOf(self.hostname),
                span = '<span/>',
                anchor = $(self).wrapInner(span).children().addClass('anchor-text');

            $(span).addClass('anchor-icon').css({
                backgroundImage: "url('{0}'), url(/img/tiny.png)".format(sprite),
                backgroundPosition: '{0}px {1}px, 0px 0px'.format(0, -16 * index)
            }).insertBefore(anchor);
        });
    });
}(window,jQuery,nbrut);