!function(window,$,nbrut){
    nbrut.tt.init();

    var body = $('body');

    body.on('keydown', function(e){
        if(e.which === 27){ // esc
            var dialogs = body.find('.dialog')
            if (dialogs.length > 0){
                dialogs.fadeOutAndRemove();
                return false;
            }
        }
    });
}(window,jQuery,nbrut);