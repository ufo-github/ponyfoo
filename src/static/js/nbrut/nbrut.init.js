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

    $.ajaxSetup({
        timeout: 20000 // long-polling sets it's own timeout anyways
    });
}(window,jQuery,nbrut);