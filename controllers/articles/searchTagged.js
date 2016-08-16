'use strict';

const articleListHandler = require(`./lib/articleListHandler`);
const searchResults = require(`./lib/searchResults`);
const articleSearchService = require(`../../services/articleSearch`);

module.exports = function (req, res, next) {
  const rtagSeparator = /[+/,_: ]+/ig;
  const rtermSeparator = /[+/,_: -]+/ig;
  const input = req.params.terms;
  const tags = req.params.tags.split(rtagSeparator);
  const terms = input.split(rtermSeparator);
  const handlerOpts = {
    search: true,
    queryTerms: terms,
    queryTags: tags
  };
  const handle = articleListHandler(res, handlerOpts, searchResults(res, next));

  res.viewModel = {
    model: {
      meta: {
        canonical: `/articles/search/` + terms.join(`-`) + `/tagged/` + tags.join(`+`)
      },
      action: `articles/search-results`,
      query: articleSearchService.format(terms, tags)
    }
  };

  articleSearchService.query(input, { tags: tags, populate: `author` }, handle);
};
