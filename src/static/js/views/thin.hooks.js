!function (window,$,nbrut,moment,undefined) {
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

            self.commentsUrl = self.permalink + '/comments';

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