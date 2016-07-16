'use strict';

var omnibox = require('omnibox');
var queso = require('queso');

function linkThroughForSlug (slug) {
  return linkThrough;

  function linkThrough (href) {
    if (!href) {
      return href;
    }
    var u = omnibox.parse(href);
    if (u.protocol && u.protocol !== 'http' && u.protocol !== 'https') {
      return href;
    }

    Object
      .keys(u.query)
      .filter(whereUtm)
      .forEach(removeProp);

    u.query.utm_source = 'ponyfoo+weekly';
    u.query.utm_medium = 'email';

    if (slug) {
      u.query.utm_campaign = slug;
    }

    var rspace = /(%2B|\s)/ig;
    var host = u.host ? u.protocol + '://' + u.host : '';

    return (
      host +
      u.pathname +
      queso.stringify(u.query).replace(rspace, '+') +
      (u.hash || '')
    );

    function removeProp (key) {
      delete u.query[key];
    }
  }
}

function whereUtm (key) {
  return key.slice(0, 4) === 'utm_';
}

module.exports = {
  linkThroughForSlug: linkThroughForSlug
};
