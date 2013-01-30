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
}(window,jQuery,nbrut);