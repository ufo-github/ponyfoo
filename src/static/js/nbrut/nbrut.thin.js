!function (window, $, nbrut, undefined) {
    var ver = '/api/1.0',
        hooks = {},
        pending = [];

    function part(p){
        if(!!p){
            return '/{0}'.format(p);
        }
        return '';
    }

    function get(what, opts){
        var id = part(opts.id);

        fire('GET',what,id).done(function(res){
            (hooks[what].ajaxGet || $.noop)(data);
            (opts.then || $.noop)(data);
        });
    }

    function put(what, opts){
        var id = part(opts.id);

        fire('PUT',what,id).done(function(data){
            (opts.then || $.noop)(data);
        });
    }

    function del(what, opts){
        fire('DELETE',what,opts.id).done(function(data){
            (opts.then || $.noop)(data);
        });
    }

    function fire(how,what,id){
        var xhr = $.ajax({
            url: '{0}/{1}{2}'.format(ver, what, id),
            type: how
        });
        pending.push(xhr);

        return xhr.always(function(data,status,err){
            var i = pending.indexOf(xhr);
            pending.splice(i,1);
        });
    }

    function hook(what, opts){
        hooks[what] = opts;
    }

    function abort(){
        $.each(pending, function(){
            this.abort();
        });
    }

    nbrut.thin = {
        get: get,
        put: put,
        del: del,
        hook: hook,
        abort: abort
    };
}(window, jQuery, nbrut);