'use strict';

function welcome (version) {
  var message = [
    '%cWelcome, adventurer! Pony Foo is running on version %s.',
    'Feel free to play around with our globals: $, md, and moment!'
  ].join('\n');

  var css = 'color: #e92c6c; font-size: 3em; font-family: "Neuton" "Helvetica Neue", HelveticaNeue, TeXGyreHeros, FreeSans, "Nimbus Sans L", "Liberation Sans", Helvetica, Arial, sans-serif;';

  console.log(message, css, version);
}

module.exports = welcome;
