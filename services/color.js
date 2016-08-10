'use strict';

const _ = require('lodash');
const fs = require('fs');
const color = require('color');
const cd = require('color-difference');
const textService = require('./text');
const colorGuide = fs.readFileSync('./client/css/variables/colors.styl', 'utf8');
const colorGuideLines = colorGuide.split('\n');
const rcomment = /^\s*\/(\/|\*)\s*/i;
const rcolor = /^\s*c-([\w-]+)\s*=\s*(#[0-9a-f]{3,6})\s*$/i;
let matches = 0;
const sections = [];
const colorVariableLines = colorGuideLines.filter(isColorVariable);
const colorProfiles = colorVariableLines.map(toColorProfile);
const sortedColorProfiles = colorProfiles.sort(byDistance).sort(bySection);
const api = {
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
  const section = _.findLast(sections, isBelowIndex);
  return section;
  function isBelowIndex (section) {
    return section.index <= i;
  }
}

function toColorProfile (line, i) {
  const section = getSection(i);
  const matches = rcolor.exec(line).slice(1);
  const name = textService.hyphenToCamel(matches[0]);
  const hex = matches[1];
  const rbreak = /([a-z])([A-Z0-9])/g;
  const rdecimal = /0([0-9]+)/g;
  const displayName = name.replace(rbreak, '$1 $2').replace(rdecimal, '0.$1');
  const displayNameUpper = up(displayName);
  const profile = {
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
