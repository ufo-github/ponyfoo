# Pony Foo [![Build Status][1]][2]

> Open-source blogging platform

Supported Browsers: IE 10+, Chrome, Safari, Firefox

LAUNCH

- flash intro page

TODO

- deployment script
- canonical, etc: fill metadata (see defaultRequestModel.js)

PERFORMANCE

- revving
- critical path css inline
- further unbloat all.js
  - load FAT js after page completes loading

NICETIES

- (author) email composer with subject, intro, and markdown body
- (author) bio editor!
- bio show up as aside box.
- flash should be in layout really?
- cmd + enter look up a lib that has simple api


OBSCURE BUGS

- json when navigating back is SUPER AWKWARD!
- views that respond with json e.g 404, should prob use a taunus method?



  [1]: https://travis-ci.org/ponyfoo/ponyfoo.png?branch=master
  [2]: https://travis-ci.org/ponyfoo/ponyfoo
