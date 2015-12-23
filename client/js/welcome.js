'use strict';

function welcome (version) {
  var message = [
    '%c████████████████████████████████████████████%c████%c████',
    '%c████████████████████████████████████████████%c████%c████',
    '%c████████████████████████████████████████%c████%c████',
    '%c████████████████████████████████████████%c████%c████',
    '%c████████████%c████%c████%c████%c████%c████%c████%c████%c████',
    '%c████████████%c████%c████%c████%c████%c████%c████%c████%c████',
    '%c████████%c████%c████████████████████████████',
    '%c████████%c████%c████████████████████████████',
    '%c████%c████%c████%c████████████████████████████',
    '%c████%c████%c████%c████████████████████████████',
    '%c████%c████%c████████████████%c████%c████%c████████%c████',
    '%c████%c████%c████████████████%c████%c████%c████████%c████',
    '%c████████████████████████%c████████%c████████',
    '████████████████████████%c████████%c████████',
    '████████████████████████████████████████',
    '████████████████████████████████████████',
    '████████████████████████████████████████%c████%c',
    '████████████████████████████████████████%c████%c',
    '████████████████████████████████████████████',
    '████████████████████████████████████████████',
    '████████████████████████████████████████████',
    '████████████████████████%c████%c████%c████████████',
    '████████████████████████%c████%c████%c████████████',
    '████████████████████████████%c████%c',
    '████████████████████████████%c████%c',
    '████████████████████████████████%c████%c',
    '████████████████████████████████%c████',
    '',
    '%cWelcome, adventurer! Pony Foo is running on version %s.',
    'Feel free to play around with our globals: $, md, and moment!'
  ].join('\n');

  var logoFont = 'font-family: Arial; font-size: 11px;';
  var green = 'color: #26EF00; ' + logoFont;
  var greenIris = 'color: #26E400; ' + logoFont;
  var oneas = 'color: #1a1a1a; ' + logoFont;
  var threes = 'color: #333333; ' + logoFont;
  var fourds = 'color: #4d4d4d; ' + logoFont;
  var black = 'color: #000000; ' + logoFont;
  var transparent = 'color: transparent; ' + logoFont;
  var css = 'color: #e92c6c; font-size: 1.4em; font-family: "Neuton" "Helvetica Neue", HelveticaNeue, TeXGyreHeros, FreeSans, "Nimbus Sans L", "Liberation Sans", Helvetica, Arial, sans-serif;';

  console.log(
    message,

    transparent, threes, black,
    transparent, threes, black,

    transparent, fourds, black,
    transparent, fourds, black,

    transparent, threes, black, oneas, transparent, oneas, transparent, threes, black,
    transparent, threes, black, oneas, transparent, oneas, transparent, threes, black,

    transparent, threes, black,
    transparent, threes, black,

    transparent, threes, oneas, black,
    transparent, threes, oneas, black,

    threes, oneas, black, green, greenIris, black, oneas,
    threes, oneas, black, green, greenIris, black, oneas,

    black, green, black,
    green, black,

    threes, black,
    threes, black,

    threes, transparent, black,
    threes, transparent, black,

    threes, black,
    threes, black,

    threes, black,
    threes,

    css, version
  );
}

module.exports = welcome;
