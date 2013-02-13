!function (window, $, nbrut, moment, undefined) {
    var ui = function(){
        function enable(button){
            var originalText = button.data('text');

            button.prop('disabled', false);
            button.text(originalText);
        }

        function disable(button){
            var disabledText = button.data('text-disabled');

            button.prop('disabled', true);
            button.text(disabledText);
        }

        return {
            disable: disable,
            enable: enable,
            breaks: {
                medium: {
                    width: 768
                }
            }
        };
    }();

    nbrut.ui = ui;

    moment.defaultFormat = 'YYYY/MM/DD';
    moment.fullFormat = 'MMMM Do, YYYY [at] hh:mm a';
    moment.dayFormat = 'MMMM Do, YYYY';
    moment.monthFormat = 'MMMM YYYY';
    moment.yearFormat = 'YYYY';
}(window, jQuery, nbrut, moment);