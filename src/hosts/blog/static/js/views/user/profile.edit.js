!function (window,$,nbrut, undefined) {
    'use strict';

    function prepare(render, data){
        if(data.id !== window.locals.id){
            render(null, true);
        }

        nbrut.thin.get('user',{
            id: data.id,
            context: 'prepare',
            done: function(data){
                var user = data.user;
                render(user, user === null || user.me === false);
            }
        });
    }

    function afterActivate(){
        bindSave();
    }

    function bindSave(){
        var save = $('#profile-edit-submit');
        save.on('click.submit', function(){
            nbrut.ui.disable(save);

            var id = save.data('id'),
                data = {
                    password: $('.user-password').val(),
                    website: {
                        title: $('.website-title').val(),
                        url: $('.website-url').val()
                    },
                    commentNotifications: $('.comment-notifications').is(':checked'),
                    bio: $('#wmd-input-bio').val()
                };

            nbrut.thin.put('user', {
                id: id,
                data: { user: data },
                context: $('.user-profile-card'),
                done: function(){
                    nbrut.tt.activate('user-profile', {
                        data: { id: id }
                    });
                },
                always: function(){
                    nbrut.ui.enable(save);
                }
            });
        });
    }

    nbrut.tt.configure({
        key: 'user-profile-edit',
        prepare: prepare,
        afterActivate: afterActivate
    });
}(window,jQuery,nbrut);