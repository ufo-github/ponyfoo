!function (window,$,nbrut,moment,undefined) {
    var html = nbrut.md.html;

    function entryHook(data){
        $.each(data.entries || [data.entry], function(){
            var self = this, d;

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

        $.each(data.discussions || [], function(){
            var self = this;

            $.each(self.comments, function(){
                var comment = this;

                comment.html = nbrut.md.html(comment.text);
            });
        });
    }

    function discussionHook(data){
        if (!!data.comment){
            data.comment.html = html(data.comment.text);
        }
    }

    nbrut.thin.hook('entry', {
        get: entryHook,
        put: discussionHook
    });

    nbrut.thin.hook('discussion', {
        put: discussionHook
    });
}(window,jQuery,nbrut,moment);