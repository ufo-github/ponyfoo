!function (window,$,nbrut, undefined) {
    'use strict';

    var profile = $('.user-profile-menu');
    nbrut.tt.templateLinks(profile);

    function prepare(render, data){
        nbrut.thin.get('user',{
            id: data.id,
            context: 'prepare',
            done: function(data){
                var viewModel = data.user;
                if (viewModel !== null){
                    viewModel.meta = {
                        title: "{0}'s profile.".format(viewModel.displayName),
                        description: 'This user has not provided a personal bio yet.'
                    };
                }
                render(viewModel, viewModel === null);
            }
        });
    }

    nbrut.tt.configure({
        key: 'user-profile',
        prepare: prepare
    });
}(window,jQuery,nbrut);