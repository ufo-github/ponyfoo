!function(window,jQuery,prettyPrint) {
    function codeHighlights() {
        $('.prettyprint:not(.prettyprinted)').find('code').each(function(){
            var lines = $(this).html().split('\n'),
                code,
                startIndex,
                length,
                highlight = lines[0][0] !== '|';

            function section(start,len,highlight) {
                var element = $('<code/>'),
                    value = lines.slice(start,start+len),
                    text = value.join('\n');

                if(text.length === 0){
                    return;
                }
                if (highlight){
                    element.addClass('highlight');
                }
                element.html(text);

                if(code === undefined){
                    code= element;
                }else{
                    code.after(element);
                }
            }

            for(var i = 0; i < lines.length; i++){
                if (lines[i][0] !== '|') {
                    direction = true;
                } else {
                    lines[i] = lines[i].substr(1);
                    if (lines[i][0] === ' '){ // actually replace the pipe if it's followed by space.
                        lines[i] = ' ' + lines[i];
                    }
                    direction = false;
                }
                if(highlight === direction){
                    section(startIndex,length,highlight);
                    startIndex = i;
                    highlight = !direction;
                    length = 0;
                }
                length++;
            }

            section(startIndex,length,highlight);
            $(this).replaceWith(code);
        });
    }

    var oldPrint = window.prettyPrint;

    window.prettyPrint = function(opt,whenDone){
        codeHighlights();
        oldPrint(opt,whenDone);
    }
}(window,jQuery,prettyPrint);