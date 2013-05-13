!function (window,$,nbrut,Math,undefined) {
    'use strict';

    var opts = {
            flashFill: false
        },
        colors = [
            '#412917',
            '#5f4c3d',
            '#58af48',
            '#67b053',
            '#429334',
            '#027902',
            '#4cdb33',
            '#94d589',
            '#db0',
            '#ffc',
            '#e92c6c',
            '#d37092',
            '#ffd2d2',
            '#d11911',
            '#7a0000',
            '#2865b3',
            '#a4d4e6',
            '#b8dae7',
            '#92c5d8'
        ];

    if(opts.flashFill){
        nbrut.tt.hook('fill', function(container){
            var color = colors[Math.floor(Math.random()*colors.length)];
            container.flash(color);
        });
    }
}(window,jQuery,nbrut,Math);