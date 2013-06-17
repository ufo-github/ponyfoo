'use strict';

function slug(text) {
    text = text.replace(/^\s+|\s+$/g, ''); // trim
    text = text.toLowerCase();

    var from = "ãàáäâẽèéëêìíïîõòóöôùúüûñç·/_,:;";
    var to   = "aaaaaeeeeeiiiiooooouuuunc------";
    for (var i = 0, l = from.length; i < l; i++) {
        text = text.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }

    text = text.replace(/[^a-z0-9 \-]/g, '') // remove invalid chars
        .replace(/\s+/g, '-') // collapse whitespace and replace by -
        .replace(/-+/g, '-'); // collapse dashes

    return text;
}

function truncate(source, cap){
    var text = source.trim(), index;
    if (text.length > cap){
        text = text.substr(0, cap);
        index = text.lastIndexOf(' ');

        if(index !== -1){ // truncate the last word, which might have been trimmed
            text = text.substr(0, index);
        }

        text += ' [...]';
    }
    return text;
}

module.exports = {
    slug: slug,
    truncate: truncate
};