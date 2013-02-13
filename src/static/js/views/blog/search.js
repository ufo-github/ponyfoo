!function (window,$,nbrut,undefined) {
    var input = $('#search'),
        button = $('.search-button');

    button.on('click', search);
    input.on('keypress', function(e){
        if(e.which === 13){
            search();
        }
    });

    function search(){
        var keywords = input.val();
        if (keywords.length !== 0){
            var route = nbrut.tt.getRoute('/search/' + keywords);
            nbrut.tt.activateRoute(route);
        }else{
            nbrut.tt.activate('home');
        }
    }

    nbrut.tt.hook('beforeActivate', function(template,settings){
        if(template.key === 'home' && settings.key === 'search'){
            input.val(settings.data.terms);
        }else{
            input.val(''); // clear before switching to other templates
        }
    });
}(window,jQuery,nbrut);