'use strict';

var $ = require('dominus');
var taunus = require('taunus');

function linkifyHeadings () {
  taunus.on('render', render);
}

function render (container) {
  $('.md-markdown', container)
    .find('h1,h2,h3,h4,h5,h6')
    .map(wrapInline)
    .find('.md-heading')
    .on('mouseenter', function (e) {
      $(e.target).parent().addClass('md-heading-hover');
    })
    .on('mouseleave', function (e) {
      $(e.target).parent().removeClass('md-heading-hover');
    });

  function wrapInline (el) {
    var $el = $(el);
    var id = $el.attr('id');
    return $el.html(`<a href="#${ id }" class="md-heading">${ $el.html() }</a>`);
  }
}

module.exports = linkifyHeadings;
