!function (window,$,nbrut,undefined) {
    function validationMessages(xhr, textStatus){
        var response, validation;

        if(textStatus === 'timeout'){
            validation = ['The matrix is not responding to your request'];
        }else if(!!xhr.responseText){
            response = JSON.parse(xhr.responseText);

            if(xhr.status === 400){ // request validation failed
                validation = response.error.data.validation;
            }else if(xhr.status === 404){ // resource not found
                validation = ['Resource not found in the matrix. Try again later'];
            }else if(xhr.status === 500){ // mayhem!
                validation = ['Oops! The matrix won\'t cooperate with your request'];
            }
        }

        if($.isArray(validation)){
            var context = this;
            if (context === window){
                validationInDialog(validation);
            }else{
                validationInContext(validation, context);
            }

            nbrut.tt.reloadIfStuck();
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