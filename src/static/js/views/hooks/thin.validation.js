!function (window,$,nbrut,undefined) {
    function validationMessages(xhr){
        if(xhr.status === 400){ // request validation failed
            var response = JSON.parse(xhr.responseText),
                validation = response.error.data.validation;

            if($.isArray(validation)){
                var context = this;
                if (context === window){
                    validationInDialog(validation);
                }else{
                    validationInContext(validation, context);
                }
            }
        }
    }

    function validationInDialog(validation){
        var body = $('body'),
            partial = nbrut.tt.partial('validation-dialog', { errors: validation });

        body.find('.validation-dialog').remove();
        partial.appendTo(body);
    }

    function validationInContext(validation, context){
        var partial = nbrut.tt.partial('validation-errors', { errors: validation });

        removeMessageInContext(context);
        partial.prependTo(context);

        context.scrollIntoView();
    }

    function clearValidationMessages(){
        var context = this;
        if (context !== window){
            removeMessageInContext(context);
        }
    }

    function removeMessageInContext(context){
        context.find('.validation-errors:first-child').remove();
    }

    nbrut.thin.hook('fail', validationMessages);
    nbrut.thin.hook('done', clearValidationMessages);
}(window,jQuery,nbrut);