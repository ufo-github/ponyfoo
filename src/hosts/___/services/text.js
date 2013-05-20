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
	
module.exports = {
    slug: slug
};