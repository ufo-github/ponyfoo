!function (window,$,nbrut, undefined) {
    function prepare(render, data){
        nbrut.thin.get('user',{
            id: data.id,
            then: function(data){
                var user = data.user;
                render(user, user === null);
            }
        });
    }

    nbrut.tt.configure({
        key: 'user-profile-edit',
        prepare: prepare
    })
}(window,jQuery,nbrut);