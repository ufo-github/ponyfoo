!function (window,$,nbrut, undefined) {
    function prepare(render, data){
        if(data.id !== nbrut.locals.id){
            render(null, true);
        }

        nbrut.thin.get('user',{
            id: data.id,
            then: function(data){
                var user = data.user;
                render(user, user === null || user.me === false);
            }
        });
    }

    function afterActivate(){
        nbrut.md.runEditor('-bio');
    }

    nbrut.tt.configure({
        key: 'user-profile-edit',
        prepare: prepare,
        afterActivate: afterActivate
    })
}(window,jQuery,nbrut);