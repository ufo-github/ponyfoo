!function (window,$,nbrut, undefined) {
	var profile = $('.user-profile-menu');
    nbrut.tt.templateLinks(profile);

    function prepare(render, data){
        nbrut.thin.get('user',{
            id: data.id,
            done: function(data){
                var user = data.user;
                render(user, user === null);
            }
        });
    }

    nbrut.tt.configure({
        key: 'user-profile',
        prepare: prepare
    })
}(window,jQuery,nbrut);