!function (window, $) {
    function preProcessHighlights() {
        $('pre.prettyprint:not(.prettyprinted)').each(function () {
            var self = $(this).addClass('linenums'),
                code = self.find('code'),
                lines = code.html().split('\n'),
                highlights = [],
                result;

            for (var i = 0; i < lines.length; i++) {
                if (lines[i][0] === '|') {
                    highlights.push(i);
                    lines[i] = lines[i].substr(1);
                    if (lines[i][0] === ' ') { // if pipe is followed by space, preserve indentation.
                        lines[i] = ' ' + lines[i];
                    }
                }
            }

            if(!!highlights.length){ // only change behavior if some lines are to be highlighted.
                result = lines.join('\n');
                self.addClass('highlights').data('highlights', {
                    lines: highlights
                });
                code.html(result);
            }
        });
    }

    function postProcessHighlights() {
        $('pre.prettyprint.highlights').each(function(){
           var self = $(this),
               highlights = self.data('highlights'),
               items;

           if(!highlights.applied){
               items = self.find('ol.linenums li');

               $.each(highlights.lines, function(){
                   items.eq(this).addClass('highlight');
               });

               self.data('highlights', { applied: true });
           }
        });
    }

    var oldPrint = window.prettyPrint;

    window.prettyPrint = function (opt_whenDone) {
        preProcessHighlights(); // store highlighted line numbers.
        var result = oldPrint.apply(this, arguments);
        postProcessHighlights(); // highlight lines.
        return result;
    };
}(window, jQuery);