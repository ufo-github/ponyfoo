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

            function disable(){
                button.prop('disabled', true);
                buttonText.text(disabledText);
            }

            button.on('click', function(){
                disable();
                action(restore);
            });
            restore();
        }

        return {
            stateButton: stateButton
        };
    }();

    moment.defaultFormat = 'YYYY/MM/DD';
    moment.fullFormat = 'MMMM Do, YYYY [at] hh:mm a';
    moment.dayFormat = 'MMMM Do, YYYY';
    moment.monthFormat = 'MMMM YYYY';
    moment.yearFormat = 'YYYY';
    nbrut.ui = ui;
}(window, jQuery, nbrut, moment);