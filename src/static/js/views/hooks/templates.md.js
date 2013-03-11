!function (window,$,nbrut,undefined) {
    'use strict';

    nbrut.tt.hook('fill', function(container){
        var prefix = 'wmd-input',
            inputs = container.find('.wmd-input');

        inputs.each(function(){
            var id = this.id, p = id.indexOf(prefix), postfix;

            if(p !== 0){
                throw new Error('invalid markdown editor id: "{0}"'.format(id));
            }

            postfix = id.substr(prefix.length);
            nbrut.md.runEditor(postfix);
        });

        var md = container.find('.markdown');
        nbrut.md.prettify(md);
    });
}(window,jQuery,nbrut);