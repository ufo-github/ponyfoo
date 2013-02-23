!function (window,$,nbrut,undefined) {
    function validationMessages(xhr){
        var response = JSON.parse(xhr.responseText),
            validation;

        if(xhr.status === 400){ // request validation failed
            validation = response.error.data.validation;
        }else if(xhr.status === 404){ // resource not found
            validation = ['Resource not found'];
        }

        if($.isArray(validation)){
            var context = this;
            if (context === window){
                validationInDialog(validation);
            }else{
                validationInContext(validation, context);
            }
        }
    }

    function validationInDialog(validation){
        var body = $('body'),
            partial = nbrut.tt.partial('validation-dialog', { errors: validation, unclosable: true });

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