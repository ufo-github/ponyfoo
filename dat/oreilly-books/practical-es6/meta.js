'use strict';

const description = `Modular JavaScript is a book series focusing on building small interconnected ES6 JavaScript modules that emphasizes on maintainability. Practical ES6 is the first book in the series, and it discusses ES6 features in detail. Practical ES6 includes hundreds of real-world use cases for the new language features, as well as detailed explanations of what works and what hasn’t when it comes to leveraging ES6 in the wild.`;

module.exports = {
  publication: new Date(`2017`, `2`, `15`),
  publisher: `O’Reilly Media`,
  isbn: `978-1-4919-4353-3`,
  slug: `practical-es6`,
  repo: {
    url: `oreillymedia/modular-es6`,
    branch: `master`
  },
  github: `https://github.com/mjavascript/practical-es6`,
  title: `Practical ES6`,
  teaser: `A Practical Dive into ES6 and Maintainable JavaScript Modules \u2014 Modular JavaScript Book Series`,
  oneline: `Features and practical application of ES6 in your production applications.`,
  pages: `~200`,
  coverHref: `/img/mjavascript/practical-es6.png`,
  description
};
