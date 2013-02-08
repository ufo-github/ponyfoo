!function (window,$,nbrut,undefined) {
    function bindExit(viewModel, data, ctx){
        var cancel = ctx.elements,
            exits = viewModel.discussions.find('.edit, .remove, .discussion-reply, .discussion-create');

        viewModel.comment.addClass('comment-editing');
        cancel.on('click.exit', exit);
        exits.on('edit-exit', exit);

        var submit = viewModel.actions.find('.discussion-create'),
            submitText = submit.data('text'),
            submitTextDisabled = submit.data('text-disabled');

        function setSubmitStates(regular,active){
            submit.text(regular);
            submit.data('text', regular);
            submit.data('text-disabled', active);
        }

        submit.data('edit', {
            id: viewModel.id,
            parent: {
                what: 'discussion',
                id: viewModel.discussionId
            }
        });
        setSubmitStates('Save Edits', 'Saving...');

        function exit(){
            exits.off('edit-exit');
            viewModel.comment.removeClass('comment-editing');
            viewModel.textarea.val('').trigger('paste');
            cancel.remove();
            submit.removeData('edit');
            setSubmitStates(submitText, submitTextDisabled);
        }
    }

    nbrut.tt.configure({
        key: 'comment-edit',
        afterActivate: bindExit
    })
}(window,jQuery,nbrut);