!function(window,$,nbrut){
    nbrut.tt.init();

    var body = $('body');

    body.on('keydown.close', function(e){
        if(e.which === 27){ // esc
            var dialogs = body.find('.dialog');
            if (dialogs.length > 0){
                dialogs.trigger('container.close');
                return false;
            }
        }
    });

    body.on('dragover.prevent drop.prevent', function(e){
        e.preventDefault(); // prevent browsers from doing clunky stuff.
    });
}(window,jQuery,nbrut);