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

    function commentHook(data){
        if (data.discussions !== undefined){
            data.discussions.forEach(function(discussion){
                discussion.comments.forEach(function(comment){
                    comment.html = html(comment.text);
                });
            });
        }
    }

    function commentPutHook(data){
        if (data.comment !== undefined){
            data.comment.html = html(data.comment.text);
        }
    }

    nbrut.thin.hook('entry', { get: entryHook });
    nbrut.thin.hook('comment', { get: commentHook, put: commentPutHook });
}(window,jQuery,nbrut,moment);