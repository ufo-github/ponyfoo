!function (window,$,nbrut,undefined) {
    function unified(elements,buttonClass,opts){
        var editor = elements.find('.comment-editor'),
            textarea = elements.find('.wmd-input'),
            postfix = textarea.data('postfix'),
            button = elements.find(buttonClass),
            container = $('.blog-discussions'),
            remove = elements.find('.remove');

        nbrut.md.runEditor(postfix);

        button.on('click.comment', function(){
            if(editor.is(':hidden')){
                container.find('.comment-editor').hide();
                editor.show();
                return;
            }

            textarea.prop('disabled', true);

            nbrut.ui.disable(button);
            nbrut.thin.put('comment', {
                parent: opts.parent,
                data: { comment: textarea.val() },
                then: function(data){
                    textarea.val('');
                    textarea.prop('disabled', false);

                    elements.find('.blog-comment').empty(); // clear preview
                    nbrut.ui.enable(button);

                    opts.done(elements,data);
                }
            });
        });
    }

    function afterPuttingDiscussion(elements,data){
        var model = {
                _id: data.discussion,
                comments: [data.comment]
            },
            partial = nbrut.tt.partial('discussion-thread', model),
            thread = partial.insertBefore(elements);

        var reply = nbrut.tt.partial('discussion-reply', { id: data.discussion });
        reply.appendTo(thread);

        nbrut.md.prettify(thread);
    }

    function afterPuttingComment(elements,data){
        var partial = nbrut.tt.partial('discussion-comment', data.comment),
            comment = partial.insertBefore(elements);

        nbrut.md.prettify(comment);
    }

    function afterCommentButton(viewModel, data, ctx){
        unified(ctx.elements,'.discussion-create',{
            parent: {
                what: 'entry',
                id: viewModel.entryId
            },
            done: afterPuttingDiscussion
        });
    }

    function afterReplyButton(viewModel, data, ctx){
        unified(ctx.elements,'.discussion-reply',{
            parent: {
                what: 'discussion',
                id: viewModel.id
            },
            done: afterPuttingComment
        });
    }

    function afterList(viewModel, data, ctx){
        var elements = ctx.elements,
            comments = elements.find('.blog-comment');

        bindCommentActions(comments);
    }

    function afterReplying(viewModel, data, ctx){
        bindCommentActions(ctx.elements);
    }

    function bindCommentActions(comments){
        comments.each(actions);

        function actions(){
            var comment = $(this),
                discussion = comment.parents('.blog-discussion');

            comment.find('.remove').on('click.remove', function(){
                nbrut.thin.del('comment',{
                    id: comment.data('id'),
                    parent: {
                        what: 'discussion',
                        id: discussion.data('id')
                    },
                    then: function(){
                        if(!comment.is(':first-child')){
                            comment.slideUpAndRemove();
                        }else{
                            discussion.slideUpAndRemove();
                        }
                    }
                });
            });
        }
    }

    nbrut.tt.configure({
        key: 'discussion-actions',
        afterActivate: afterCommentButton
    });
    nbrut.tt.configure({
        key: 'discussion-reply',
        afterActivate: afterReplyButton
    });

    nbrut.tt.configure({
        key: 'discussion-comment',
        afterActivate: afterReplying
    });
    nbrut.tt.configure({
        key: 'discussion-thread',
        afterActivate: afterList
    });
    nbrut.tt.configure({
        key: 'discussion-list',
        afterActivate: afterList
    });
}(window,jQuery,nbrut);