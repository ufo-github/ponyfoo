'use strict';

var rspaces = /\s+/g;
var rinvalid = /[^\x20\x2D0-9A-Z\x5Fa-z\xC0-\xD6\xD8-\xF6\xF8-\xFF]/g;
var raccents = /[\xC0-\xFF]/g;
var accents = [
  [/[\xC0-\xC5]/g, 'A'],
  [/[\xC6]/g, 'AE'],
  [/[\xC7]/g, 'C'],
  [/[\xC8-\xCB]/g, 'E'],
  [/[\xCC-\xCF]/g, 'I'],
  [/[\xD0]/g, 'D'],
  [/[\xD1]/g, 'N'],
  [/[\xD2-\xD6\xD8]/g, 'O'],
  [/[\xD9-\xDC]/g, 'U'],
  [/[\xDD]/g, 'Y'],
  [/[\xDE]/g, 'P'],
  [/[\xE0-\xE5]/g, 'a'],
  [/[\xE6]/g, 'ae'],
  [/[\xE7]/g, 'c'],
  [/[\xE8-\xEB]/g, 'e'],
  [/[\xEC-\xEF]/g, 'i'],
  [/[\xF1]/g, 'n'],
  [/[\xF2-\xF6\xF8]/g, 'o'],
  [/[\xF9-\xFC]/g, 'u'],
  [/[\xFE]/g, 'p'],
  [/[\xFD\xFF]/g, 'y']
];
var replacements = [
  [/c#/ig, 'csharp'],
  [/f#/ig, 'fsharp']
];

function slugify (text) {
  var partial = translate(text, replacements);
  if (partial.search(raccents) === -1) {
    return partial;
  }
  return translate(partial, accents);
}

function translate (text, translations) {
  return translations.reduce(function (text, a) {
    return text.replace(a[0], a[1]);
  }, text);
}

function slug (text) {
  return slugify(text)
    .replace(rinvalid, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by '-'
    .replace(/[-_]+/g, '-') // collapse dashes
    .replace(/^-|-$/g, '') // remove leading or trailing dashes
    .trim()
    .toLowerCase();
}

function truncate (text, cap) {
  var i;
  var result = text.trim();
  if (result.length > cap) {
    result = result.substr(0, cap);
    i = result.lastIndexOf(' ');

    if (i !== -1) { // truncate the last word, which may have been trimmed
      result = result.substr(0, i);
    }
    result += ' [...]';
  }
  return result;
}

function splitTags (text) {
  return text.trim().toLowerCase().split(rspaces).filter(function (i) { return i; });
}

module.exports = {
 slug: slug,
 truncate: truncate,
 splitTags: splitTags
};
