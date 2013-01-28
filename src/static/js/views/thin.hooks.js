!function (window,$,nbrut,moment) {
    function entryHook(data){
        $.each(data.entries || [data.entry], function(){
            var self = this,
                html = nbrut.md.html,
                d;

            self.date = new Date(self.date);

            d = moment(self.date);

            self.dateText = d.format();
            self.published = d.format(moment.dayFormat);
            self.timeAgo = d.fromNow();

            self.url = '/{0}/{1}'.format(self.dateText, self.slug);
            self.absoluteUrl = nbrut.server.authority + self.url;

            self.html = {
                brief: html(self.brief),
                text: html(self.text)
            };
        });
    }

    nbrut.thin.hook('entry', {
        get: entryHook
    });
}(window,jQuery,nbrut,moment);