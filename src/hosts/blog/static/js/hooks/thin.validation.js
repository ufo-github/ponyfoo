!function (window,$,nbrut,undefined) {
    'use strict';

    function validationMessages(context, xhr, textStatus){
        var validation = parseResponseText(xhr, textStatus);

        if($.isArray(validation.messages)){
            if (!context){
                validationInDialog(validation);
            }else if(context.jquery){
                validationInContext(validation, context);
            }else if(context === 'prepare'){
                nbrut.tt.activateNotFound(); // 404
            }
        }
    }

    function parseResponseText(xhr, textStatus){
        var response,
            notFound = ['Resource not found in the matrix. Try again later'],
            result = { failed: textStatus !== 'success' };

        if(textStatus === 'timeout'){
            return ['The matrix is not responding to your request'];
        }

        if(textStatus === 'success'){
            response = xhr;
        }else if(!xhr.responseText){
            return result;
        }else{
            try{
                response = JSON.parse(xhr.responseText);
            }catch(e){
                result.messages = notFound;
                return result;
            }
        }

        if(xhr.status === 404){ // resource not found
            result.messages = notFound;
        }else if(xhr.status === 500){ // mayhem!
            result.messages = ['Oops! The matrix won\'t comply with your request'];
        }else{
            try{
                result.messages = response.meta.data.validation;
            }catch(e){
            }
        }
        return result;
    }

    function validationInDialog(validation){
        var body = $('body'),
            partial = nbrut.tt.partial('validation-dialog', {
                css: validation.failed ? 'validation-errors' : 'validation-success',
                messages: validation.messages,
                unclosable: true
            });

        body.find('.validation-dialog').remove();
        partial.appendTo(body);
    }

    function validationInContext(validation, context){
        var partial = nbrut.tt.partial('validation', {
            css: validation.failed ? 'validation-errors' : 'validation-success',
            messages: validation.messages
        });

        removeMessageInContext(context);
        partial.prependTo(context);

        context.scrollIntoView();
    }

    function removeMessageInContext(context){
        if (context && context.jquery){
            context.find('.validation:first-child').remove();
        }
    }

    nbrut.thin.hook('done', removeMessageInContext);
    nbrut.thin.hook('always', validationMessages);
}(window,jQuery,nbrut);