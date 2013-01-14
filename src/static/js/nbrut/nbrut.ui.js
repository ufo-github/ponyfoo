!function (window, $, nbrut, moment, undefined) {
    var ui = function(){
        function stateButton(button, action) {
            var buttonText = button.find('span'),
                originalText = buttonText.data('text'),
                disabledText = buttonText.data('text-disabled');

            function restore(){
                button.prop('disabled', false);
                buttonText.text(originalText);
            }

            function restoreWithOptionalTimeout(timeout){
                if(!!timeout){
                    setTimeout(function(){ // graceful animation.
                        restore();
                    }, timeout);
                }else{
                    restore();
                }
            }

            function disable(){
                button.prop('disabled', true);
                buttonText.text(disabledText);
            }

            button.on('click', function(){
                disable();
                action(restoreWithOptionalTimeout);
            });
            restore();
        }

        return {
            stateButton: stateButton
        };
    }();

    moment.defaultFormat = 'YYYY/MM/DD';
    moment.fullFormat = 'YYYY/MM/DD HH:mm:ss';
    nbrut.ui = ui;
}(window, jQuery, nbrut, moment);