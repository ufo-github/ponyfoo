function read(template) {
    var s = $(template.source).remove();

    var cacheKey = 'template::{0}'.format(template.key);
    var cached = nbrut.local.get(cacheKey);
    if (cached === undefined) {
        if (s.length !== 1){
            throw new Error('template source not unique.');
        }
        var css = s.data('class');
        var html = s.html();

        cached = {
            html: html,
            css: css
        };

        nbrut.local.set(cacheKey, cached);
    }

    return cached;
}