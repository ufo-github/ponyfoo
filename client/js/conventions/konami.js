'use strict';

var $ = require('dominus');
var cheet = require('cheet.js');
var loading = require('./loading');
var konamiCode = '↑ ↑ ↓ ↓ ← → ← → b a';
var doc = document;
var active;

function konami () {
  cheet(konamiCode, render);
}

function appendCSS (count) {
  var css = makeCSS(count);
  var head = doc.head || doc.getElementsByTagName('head')[0];
  var style = doc.createElement('style');
  style.id = '_konami-code';
  style.type = 'text/css';
  if (style.styleSheet){
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(doc.createTextNode(css));
  }
  head.appendChild(style);
}

function makeCSS (count) {
  var i
  var rootSelector = '.konami-code rect'
  var vendors = ['-webkit-', '-moz-', '-o-', '-ms-', '']
  var gradual = prefixed('transition', 'opacity 3s ease-in-out')
  var opacity = Math.random() + 0.2
  var base = '.konami-code{position:fixed;top:0;left:0;right:0;bottom:0;cursor:pointer;opacity:' + opacity + ';' + gradual + '}'
  var fadeaway = '.konami-code-fadeaway{opacity:0}'
  var rects = [[[''], [
    prefixed('transition', 'all 0.1s ease-in-out'),
    prefixed('animation-name', 'konami-0'),
    prefixed('animation-iteration-count', 'infinite')
  ]], [['[fill="#fef2c5"]'], [
    prefixed('animation-name', 'konami-10')
  ]], [['[fill="#f8ab6f"]'], [
    prefixed('animation-name', 'konami-15')
  ]], [['[fill="#fbf9ec"]'], [
    prefixed('animation-name', 'konami-20')
  ]], [['[fill="#ffe270"]'], [
    prefixed('animation-name', 'konami-30')
  ]], [['[fill="#e92c6c"]'], [
    prefixed('animation-name', 'konami-eye')
  ]], [['[fill="#ff0056"]'], [
    prefixed('animation-name', 'konami-eye-core')
  ]]];

  for (i = 0; i < count; i++) {
    rects.push([[':nth-child(' + i + ')'], [
      prefixed('animation-duration', 0.3 + i * 0.001 + 's')
    ]])
  }
  var kvendors = ['@-moz-', '@-webkit-', '@-o-', '@']
  var keyframes = kvendors.map(function(v) {
    return [
      ['0', '20%{fill:#e92c6c}'],
      ['10', '20%{fill:#eb417b}'],
      ['15', '20%{fill:#ec4c82}'],
      ['20', '20%{fill:#ed5689}'],
      ['30', '20%{fill:#f06b98}'],
      ['eye', '20%{fill:#ffe270}'],
      ['eye-core', '20%{fill:#f1e05a}']
    ].map(function (p) {
      return v + 'keyframes konami-' + p[0] + '{' + p[1] + '}'
    }).join('\n')
  }).join('\n')

  return [
    base,
    fadeaway,
    rects.reduce(reducer, ''),
    '.konami-rect{' + prefixed('animation-delay', '0.5s') + '}',
    keyframes
  ].join('\n')

  function reducer (css, pair) {
    var selectors = pair[0]
    var styles = pair[1].join('')
    return css + '\n' + selectors.map(function (s) { return rootSelector + s }).join(',') + '{' + styles + '}'
  }

  function prefixed (prop, value) {
    return vendors.map(function (v) { return v + prop + ':' + value + ';' }).join('');
  }
}

function render () {
  if (active) {
    return
  }
  var c = 0;
  var d = 36;
  var w = Math.max(doc.documentElement.clientWidth, window.innerWidth || 0);
  var h = Math.max(doc.documentElement.clientHeight, window.innerHeight || 0);
  var x;
  var y;
  var svg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
  for (y = -1; y < h/d+1; y++) {
    for (x = -1; x < w/d+1; x++) {
      addRect();
    }
  }
  appendCSS(c);
  svg.setAttributeNS(null, 'class', 'konami-code');
  svg.setAttributeNS(null, 'width', x * d);
  svg.setAttributeNS(null, 'height', y * d);
  doc.body.appendChild(svg);
  loading.show();
  $('.konami-code').on('click', clear);
  setTimeout(clear, 12000)
  function addRect () {
    var rect = doc.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttributeNS(null, 'width', d);
    rect.setAttributeNS(null, 'height', d);
    rect.setAttributeNS(null, 'x', x * d);
    rect.setAttributeNS(null, 'y', y * d);
    rect.setAttributeNS(null, 'fill', filler());
    if (Math.random() > 0.05) {
      rect.setAttributeNS(null, 'class', 'konami-rect')
    }
    svg.appendChild(rect);
    c++;
  }
}

function clear () {
  $('.konami-code').attr('class', 'konami-code konami-code-fadeaway');
  loading.hide();
  setTimeout(wipe, 3000);
}

function wipe () {
  $('.konami-code,#_konami-code').remove()
  active = false
}

function filler () {
  var seed = Math.random()
  if (seed > 0.95) {
    return '#f8ab6f'
  }
  if (seed > 0.9) {
    return '#fef2c5'
  }
  if (seed > 0.85) {
    return '#fbf9ec'
  }
  if (seed > 0.8) {
    return '#ffe270'
  }
  if (seed < 0.01) {
    return Math.random() > 0.5 ? '#ff0056' : '#e92c6c'
  }
  return '#fee68b'
}

module.exports = konami;
