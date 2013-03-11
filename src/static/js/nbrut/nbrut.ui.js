!function (window, $, nbrut, moment, undefined) {
    'use strict';

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

        function pagedTable(viewModel){
            if(viewModel.paging.next !== false){
                var pager = nbrut.tt.partial('table-pager', viewModel);
                pager.insertAfter(viewModel.table);
            }
        }

        function uploadExtend(opts){
            var defaults = {
                fileType: 'image',
                url: '/api/1.0/file',
                thin: {
                    name: 'file',
                    eventContext: 'PUT file'
                }
            };
            return $.extend({}, defaults, opts);
        }

        return {
            disable: disable,
            enable: enable,
            breaks: {
                medium: {
                    width: 768
                }
            },
            pagedTable: pagedTable,
            uploadExtend: uploadExtend
        };
    }();

    nbrut.ui = ui;

    moment.defaultFormat = 'YYYY/MM/DD';
    moment.fullFormat = 'MMMM Do, YYYY [at] hh:mm a';
    moment.dayFormat = 'MMMM Do, YYYY';
    moment.monthFormat = 'MMMM YYYY';
    moment.yearFormat = 'YYYY';
}(window, jQuery, nbrut, moment);