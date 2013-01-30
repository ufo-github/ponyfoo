!function (window,$,nbrut,undefined) {
    var search = $('#search');

    search.on('keypress', function(e){
        var keywords = search.val();

        if(e.which === 13){
            if(keywords.length !== 0){
                var route = nbrut.tt.getRoute('/search/' + keywords);
                nbrut.tt.activateRoute(route);
            }else{
                nbrut.tt.activate('home');
            }
        }
    });

    nbrut.tt.hook('beforeActivate', function(template,settings){
        if(template.key === 'home' && settings.key === 'search'){
            search.val(settings.data.terms);
        }else{
            search.val(''); // clear before switching to other templates
        }
    });
}(window,jQuery,nbrut);