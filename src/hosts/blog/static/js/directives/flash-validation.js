!function(nbrut){
    'use strict';

    function prependValidation(viewModel, key, css, selector){
        var messages = viewModel.flash[key];
        if (messages && messages.length){
            var validation = nbrut.tt.partial('validation', {
                css: css,
                messages: messages
            });
            validation.insertBefore(selector);
        }
    }

    nbrut.directives('flash-validation', function(viewModel, beforeTheSelector){
        prependValidation(viewModel, 'error', 'validation-errors', beforeTheSelector);
        prependValidation(viewModel, 'success', 'validation-success', beforeTheSelector);
    });
}(nbrut);