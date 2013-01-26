!function (window,$,nbrut,moment) {
    function entryHook(data){
        $.each(data.entries || [data.entry], function(){
            var self = this,
                html = nbrut.md.html;

            self.date = new Date(self.date);
            self.dateText = moment(self.date).format();
            self.published = moment(self.date).format(moment.dayFormat);

            self.updated = new Date(self.updated);
            self.updatedText = moment(self.updated).format(moment.fullFormat);
            self.updatedTimeAgo = moment(self.updated).fromNow();

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