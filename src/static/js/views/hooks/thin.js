!function (window,$,nbrut,moment,undefined) {
    var html = nbrut.md.html;

    function entryHook(data){
        $.each(data.entries || [data.entry], function(){
            var self = this, d, comments = self.commentCount, tags = self.tags;

            self.date = new Date(self.date);

            m = moment(self.date);

            self.dateText = m.format();
            self.published = m.format(moment.dayFormat);
            self.timeAgo = m.fromNow();

            self.commentsLink = self.permalink + '#comments';
            self.commentsText = '{0}Comment{1}'.format(
                !!comments ? comments + ' ' : '',
                comments !== 1 ? 's' : ''
            );

            self.html = {
                brief: html(self.brief),
                text: html(self.text)
            };

            self.keywords = tags.join(', ');
            self._tags = tags;
            self.tagged = tags.length ? 'Tagged: ' + self.keywords : '';
            self.tags = tags.join(' ');
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
        $.each(data.discussions || [], function(){
            var discussion = this,
                comments = discussion.comments;

            $.each(comments || [], function(){
                addCommentProperties(this);
            });
            addCommentProperties(discussion.last);
            discussion.commentCount = '{0} comment{1}'.format(comments.length, comments.length === 1 ? '' : 's');
        });
    }

    function commentPutHook(data){
        if (data.comment !== undefined){
            addCommentProperties(data.comment);
        }
    }

    function addCommentProperties(comment){
        if (comment !== undefined){
            comment.date = new Date(comment.date);

            var m = moment(comment.date),
                author = comment.author;

            comment.dateText = m.format();
            comment.timeAgo = m.fromNow();

            comment.html = html(comment.text);
            comment.css = 'blog-comment-author' + (author.blogger ? ' blogger' : '');

            author.gravatar = expandGravatar(author.gravatar);
        }
    }

    function userHook(data){
        $.each(data.users || [data.user], function(){
            var user = this;
            if (user === undefined){
                return;
            }
            var created = user.created,
                m = moment(created),
                me = user._id === nbrut.locals.id;

            user.me = me;
            user.created = new Date(created);
            user.createdText = m.format(moment.dayFormat);
            user.createdDate = m.format();
            user.timeAgo = m.fromNow();
            user.duration = m.fromNow(true);

            if (user.website.title === undefined || user.website.url === undefined){
                user.website = undefined; // normalize
            }

            user.profileTitle = me ? 'My Profile' : user.displayName;
            user.bioHtml = nbrut.md.html(user.bio);

            user.passwordPlaceholder = user.passwordUndefined ? 'Leave blank or choose a password' : 'Leave blank or change your password';
            user.gravatar = expandGravatar(user.gravatar);
        });
    }

    function expandGravatar(gravatar){
        var dimensions = nbrut.avatar;

        return {
            tiny: gravatar + dimensions.tiny,
            small: gravatar + dimensions.small,
            regular: gravatar + dimensions.regular,
            large: gravatar
        };
    }

    nbrut.thin.hook({
        eventName: 'done',
        context: 'GET entry'
    }, entryHook);

    nbrut.thin.hook({
        eventName: 'done',
        context: 'GET comment'
    }, commentHook);

    nbrut.thin.hook({
        eventName: 'done',
        context: 'GET discussion'
    }, commentHook);

    nbrut.thin.hook({
        eventName: 'done',
        context: 'PUT comment'
    }, commentPutHook);

    nbrut.thin.hook({
        eventName: 'done',
        context: 'GET user'
    }, userHook);
}(window,jQuery,nbrut,moment);