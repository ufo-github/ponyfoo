'use strict';

const winston = require(`winston`);

function patch (target, name, methods, filter) {
  methods.forEach(function replace (key) {
    const original = target[key];

    target[key] = function through () {
      const args = Array.prototype.slice.call(arguments);
      const interesting = (filter || always)(key, args);
      if (interesting) {
        winston.debug(name + `.%s(%s)`, key, readable(args));
      }
      return original.apply(this, args);
    };
  });
}

function readable (values) {
  const limit = 60;
  return values.map(function text (value) {
    const type = Object.prototype.toString.call(value);
    if (type === `[object Function]`) {
      return value.name || `fn`;
    }
    if (type === `[object Number]`) {
      return value;
    }
    if (type === `[object Object]`) {
      return JSON.stringify(value).substr(0, limit);
    }
    if (value && value.toString) {
      return `’` + value.toString().substr(0, limit) + `’`;
    }
    return value;
  }).join(`, `);
}

function always () {
  return true;
}

module.exports = patch;
