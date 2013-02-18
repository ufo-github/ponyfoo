!function (window,$,nbrut, undefined) {
	function afterActivate(viewModel){
        var errors = viewModel.flash.error;
        if (errors !== undefined && errors.length !== 0){
            var validation = nbrut.tt.partial('validation-errors', {
                errors: errors, closable: true
            });
            validation.insertAfter('.user-login h1');
        }
	}
	
    nbrut.tt.configure({
        key: 'user-login',
		afterActivate: afterActivate
    });
}(window,jQuery,nbrut);