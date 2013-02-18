!function (window,$,nbrut,undefined) {
    var edits = [];

    function unified(elements,buttonClass,opts){
        var editor = elements.find('.comment-editor'),
            textarea = elements.find('.wmd-input'),
            button = elements.find(buttonClass),
            container = $('.blog-discussions'),
            remove = elements.find('.remove');

        button.on('click.comment', function(){
            if(editor.is(':hidden')){
                container.find('.comment-editor').hide();
                editor.show();
                button.trigger('edit-exit');
                return;
            }

            var comment = textarea.val(),
                edit = button.data('edit') || { empty: true };

            nbrut.ui.disable(button);
            nbrut.thin.put('comment', {
                id: edit.id, // in case of edits
                parent: edit.parent || opts.parent,
                data: { comment: comment },
                context: editor,
                done: function(data){
                    textarea.val('').trigger('paste');

                    if(edit.empty === true){
                        opts.done(elements,data);
                    }else{
                        var selector = '.blog-comment[data-id={0}]'.format(edit.id),
                            target = $(selector).find('.blog-comment-text'),
                            commentHtml = nbrut.md.html(comment);

                        edits[edit.id] = comment;
                        target.html(commentHtml);
                        nbrut.md.prettify(target);
                    }

                    button.trigger('edit-exit');
                },
                always: function(){
                    nbrut.ui.enable(button);
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
    }

    function afterPuttingComment(elements,data){
        var partial = nbrut.tt.partial('discussion-comment', data.comment),
            comment = partial.insertBefore(elements);
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

    function afterThread(viewModel, data, ctx){
        ctx.elements.siblings('.blog-entry-uncommented').slideUpAndRemove();

        afterList([viewModel], data, ctx);
    }

    function afterInitialList(viewModel, data, ctx){
        afterList(viewModel.discussions, data, ctx);
    }

    function afterList(viewModel, data, ctx){
        var elements = ctx.elements,
            comments = elements.find('.blog-comment');

        bindCommentActions(comments, viewModel);
    }

    function afterReplying(viewModel, data, ctx){
        bindCommentActions(ctx.elements, [{ comments: [viewModel] }]);
    }

    function bindCommentActions(comments, discussions){
        comments.each(actions);

        function actions(){
            var comment = $(this);
            remove(comment);
            edit(comment);
        }

        function remove(comment){
            var discussion = comment.parents('.blog-discussion'),
                remove = comment.find('.remove');

            remove.on('click.remove', function(){
                remove.trigger('edit-exit');

                nbrut.thin.del('comment',{
                    id: comment.data('id'),
                    parent: {
                        what: 'discussion',
                        id: discussion.data('id')
                    },
                    done: function(){
                        if(!comment.is(':first-child')){
                            comment.slideUpAndRemove();
                        }else{
                            discussion.slideUpAndRemove();
                        }
                    }
                });
            });
        }

        function edit(comment){
            var button = comment.find('.edit');

            button.on('click.edit', function(){
                var discussions = $('.blog-discussions'),
                    discussion = comment.parents('.blog-discussion'),
                    discussionId = discussion.data('id'),
                    footer = discussions.find('.discussion-actions'),
                    buttons = footer.find('.discussion-action-buttons'),
                    editor = footer.find('.comment-editor'),
                    editors = discussions.find('.comment-editor').not(editor),
                    textarea = editor.find('.comment-input'),
                    id = comment.data('id'),
                    commentText = lookupText(id);

                button.trigger('edit-exit');

                editors.hide();
                editor.show().scrollIntoView();

                textarea.val(commentText).trigger('paste');

                var partial = nbrut.tt.partial('comment-edit', {
                    id: id,
                    discussionId: discussionId,
                    textarea: textarea,
                    discussions: discussions,
                    actions: buttons,
                    comment: comment
                });
                partial.prependTo(buttons);
            });
        }

        function lookupText(id){
            var text = edits[id];
            if (text !== undefined){
                return text;
            }

            $.each(discussions, function(){
                $.each(this.comments, function(){
                    if(this._id === id){
                        text = this.text;
                        return false;
                    }
                });

                if(text !== undefined){
                    return false;
                }
            });

            return text;
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
        afterActivate: afterThread
    });
    nbrut.tt.configure({
        key: 'discussion-list',
        afterActivate: afterInitialList
    });
}(window,jQuery,nbrut);