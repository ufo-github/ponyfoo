'use strict';

const $ = require(`dominus`);
const cheet = require(`cheet.js`);
const loading = require(`./loading`);
const konamiCode = `↑ ↑ ↓ ↓ ← → ← → b a`;
const doc = document;
let active;

function konami () {
  cheet(konamiCode, render);
}

function appendCSS (count) {
  const css = makeCSS(count);
  const head = doc.head || doc.getElementsByTagName(`head`)[0];
  const style = doc.createElement(`style`);
  style.id = `_konami-code`;
  style.type = `text/css`;
  if (style.styleSheet){
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(doc.createTextNode(css));
  }
  head.appendChild(style);
}

function makeCSS (count) {
  let i;
  const rootSelector = `.konami-code rect`;
  const vendors = [`-webkit-`, `-moz-`, `-o-`, `-ms-`, ``];
  const gradual = prefixed(`transition`, `opacity 3s ease-in-out`);
  const opacity = Math.random() + 0.2;
  const base = `.konami-code{position:fixed;top:0;left:0;right:0;bottom:0;cursor:pointer;opacity:` + opacity + `;` + gradual + `}`;
  const fadeaway = `.konami-code-fadeaway{opacity:0}`;
  const rects = [[[``], [
    prefixed(`transition`, `all 0.1s ease-in-out`),
    prefixed(`animation-name`, `konami-0`),
    prefixed(`animation-iteration-count`, `infinite`)
  ]], [[`[fill="#fef2c5"]`], [
    prefixed(`animation-name`, `konami-10`)
  ]], [[`[fill="#f8ab6f"]`], [
    prefixed(`animation-name`, `konami-15`)
  ]], [[`[fill="#fbf9ec"]`], [
    prefixed(`animation-name`, `konami-20`)
  ]], [[`[fill="#ffe270"]`], [
    prefixed(`animation-name`, `konami-30`)
  ]], [[`[fill="#e92c6c"]`], [
    prefixed(`animation-name`, `konami-eye`)
  ]], [[`[fill="#ff0056"]`], [
    prefixed(`animation-name`, `konami-eye-core`)
  ]]];

  for (i = 0; i < count; i++) {
    rects.push([[`:nth-child(` + i + `)`], [
      prefixed(`animation-duration`, 0.3 + i * 0.001 + `s`)
    ]]);
  }

  const kvendors = [`-moz-`, `-webkit-`, `-o-`, ``];
  const kframes = [
    [`0`, `20%{fill:#e92c6c}`],
    [`10`, `20%{fill:#eb417b}`],
    [`15`, `20%{fill:#ec4c82}`],
    [`20`, `20%{fill:#ed5689}`],
    [`30`, `20%{fill:#f06b98}`],
    [`eye`, `20%{fill:#ffe270}`],
    [`eye-core`, `20%{fill:#f1e05a}`]
  ];
  const keyframes = kvendors.map(vendor => kframes
    .map(([suffix, css]) => `@${vendor}keyframes konami-${suffix}{${css}}`)
    .join(`\n`)
  )
  .join(`\n`);

  return [
    base,
    fadeaway,
    rects.reduce(reducer, ``),
    `.konami-rect{${ prefixed(`animation-delay`, `0.5s`) }}`,
    keyframes
  ].join(`\n`);

  function reducer (css, [ selectors, styles ]) {
    return `${css}\n${selectors.map(s => rootSelector + s).join(`,`)}{${styles.join(``)}}`;
  }

  function prefixed (prop, value) {
    return vendors.map(vendor => `${vendor}${prop}:${value};`).join(``);
  }
}

function render () {
  if (active) {
    return;
  }
  let c = 0;
  const d = 36;
  const w = Math.max(doc.documentElement.clientWidth, window.innerWidth || 0);
  const h = Math.max(doc.documentElement.clientHeight, window.innerHeight || 0);
  let x;
  let y;
  const svg = doc.createElementNS(`http://www.w3.org/2000/svg`, `svg`);
  for (y = -1; y < h/d+1; y++) {
    for (x = -1; x < w/d+1; x++) {
      addRect();
    }
  }
  appendCSS(c);
  svg.setAttributeNS(null, `class`, `konami-code`);
  svg.setAttributeNS(null, `width`, x * d);
  svg.setAttributeNS(null, `height`, y * d);
  doc.body.appendChild(svg);
  loading.show();
  $(`.konami-code`).on(`click`, clear);
  setTimeout(clear, 12000);
  function addRect () {
    const rect = doc.createElementNS(`http://www.w3.org/2000/svg`, `rect`);
    rect.setAttributeNS(null, `width`, d);
    rect.setAttributeNS(null, `height`, d);
    rect.setAttributeNS(null, `x`, x * d);
    rect.setAttributeNS(null, `y`, y * d);
    rect.setAttributeNS(null, `fill`, filler());
    if (Math.random() > 0.05) {
      rect.setAttributeNS(null, `class`, `konami-rect`);
    }
    svg.appendChild(rect);
    c++;
  }
}

function clear () {
  $(`.konami-code`).attr(`class`, `konami-code konami-code-fadeaway`);
  loading.hide();
  setTimeout(wipe, 3000);
}

function wipe () {
  $(`.konami-code,#_konami-code`).remove();
  active = false;
}

function filler () {
  const seed = Math.random();
  if (seed > 0.95) {
    return `#f8ab6f`;
  }
  if (seed > 0.9) {
    return `#fef2c5`;
  }
  if (seed > 0.85) {
    return `#fbf9ec`;
  }
  if (seed > 0.8) {
    return `#ffe270`;
  }
  if (seed < 0.01) {
    return Math.random() > 0.5 ? `#ff0056` : `#e92c6c`;
  }
  return `#fee68b`;
}

module.exports = konami;
