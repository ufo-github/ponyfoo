!function (window,$,nbrut, undefined) {
	var profile = $('.user-profile-link');
    nbrut.tt.templateLinks(profile);

    function prepare(render, data){
        var user = null; // TODO: get from API with data.id for userId
        render(user, user === null);
    }

    nbrut.tt.configure({
        key: 'user-profile',
        prepare: prepare
    })
}(window,jQuery,nbrut);