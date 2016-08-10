'use strict';

var _ = require('lodash');
var fs = require('fs');
var color = require('color');
var cd = require('color-difference');
var textService = require('./text');
var colorGuide = fs.readFileSync('./client/css/variables/colors.styl', 'utf8');
var colorGuideLines = colorGuide.split('\n');
var rcomment = /^\s*\/(\/|\*)\s*/i;
var rcolor = /^\s*c-([\w-]+)\s*=\s*(#[0-9a-f]{3,6})\s*$/i;
var matches = 0;
var sections = [];
var colorVariableLines = colorGuideLines.filter(isColorVariable);
var colorProfiles = colorVariableLines.map(toColorProfile);
var sortedColorProfiles = colorProfiles.sort(byDistance).sort(bySection);
var api = {
  colors: {},
  colorSections: sections
};

sortedColorProfiles.forEach(addColor);
sections.forEach(sortProfiles);

module.exports = api;

function isColorVariable (line) {
  if (rcomment.test(line)) {
    sections.push({
      displayName: up(line.replace(rcomment, '')),
      index: matches,
      profiles: []
    });
    return false;
  }
  if (!rcolor.test(line)) {
    return false;
  }
  matches++;
  return true;
}

function getSection (i) {
  var section = _.findLast(sections, isBelowIndex);
  return section;
  function isBelowIndex (section) {
    return section.index <= i;
  }
}

function toColorProfile (line, i) {
  var section = getSection(i);
  var matches = rcolor.exec(line).slice(1);
  var name = textService.hyphenToCamel(matches[0]);
  var hex = matches[1];
  var rbreak = /([a-z])([A-Z0-9])/g;
  var rdecimal = /0([0-9]+)/g;
  var displayName = name.replace(rbreak, '$1 $2').replace(rdecimal, '0.$1');
  var displayNameUpper = up(displayName);
  var profile = {
    name: name,
    displayName: displayNameUpper,
    hex: hex,
    plain: hex.slice(1),
    dark: color(hex).luminosity() < 0.5,
    sectionIndex: section.index
  };
  section.profiles.push(profile);
  return profile;
}

function up (text) {
  return text.slice(0, 1).toUpperCase() + text.slice(1);
}

function sortProfiles (section) {
  section.profiles.sort(byDistance);
}

function byDistance (a, b) {
  return cd.compare('#333', b.hex) - cd.compare('#333', a.hex);
}

function bySection (a, b) {
  return b.sectionIndex - a.sectionIndex;
}

function addColor (profile) {
  api.colors[profile.name] = profile;
}
