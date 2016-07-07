'use strict';

var articleService = require('../../../services/article');
var metadataService = require('../../../services/metadata');
var textService = require('../../../services/text');
var inliningService = require('../../../services/inlining');

function factory (res, options, next) {
  if (arguments.length < 3) {
    next = options;
    options = {};
  }
  return articleListHandler;

  function articleListHandler (err, articles, extras) {
    if (err) {
      next(err); return;
    }
    var model = res.viewModel.model;
    if (!model.action) {
      model.action = 'articles/articles';

      if (articles.length === 0 && options.skip !== false) {
        res.viewModel.skip = true;
        next(); return;
      }
    }

    var keywords = metadataService.mostCommonTags(articles);
    var expanded = articleService.expandForListView(articles);
    model.articles = expanded.articles;
    model.meta.keywords = keywords;
    model.meta.images = expanded.extracted.images;

    if (extras) {
      if (extras.tags) {
        model.tags = extras.tags.map(toTagModel);
      }
    }

    if ('queryTerms' in options && 'queryTags' in options) {
      setSearchResultsMetadata();
    }

    inliningService.addStyles(model, options.search ? 'search' : 'summaries');
    next();

    function setSearchResultsMetadata () {
      model.title = getTitle({
        standalone: true
      });
      model.queryTitle = getTitle({
        standalone: true,
        hasSuffix: false,
        forcedPrefix: 'Your query for '
      });
      model.meta.description = 'This search results page contains all of the ' + getTitle({
        standalone: false
      });

      function getTitle (ctx) {
        // '[Your query for ${terms} in ][${knownTags} ]articles[ tagged ${otherTags}]'
        // '[Search results for ${terms} in ][${knownTags} ]articles[ tagged ${otherTags}]'
        var foremost = ctx.forcedPrefix || '';
        var queryPrefix = foremost ? '' : 'Search results for ';
        var suffix = ctx.hasSuffix === false ? '' : ' on Pony Foo';
        var terms = options.queryTerms.slice();
        var tags = options.queryTags.slice();
        var hasNoPrefix = ctx.standalone && foremost.length === 0;
        var hasNoPrefixOrTerms = hasNoPrefix && terms.length === 0;
        var queried = getQuery(hasNoPrefix, terms, queryPrefix);
        var tagged = getTagPrefix(hasNoPrefixOrTerms, tags) + getTagSuffix(tags);
        var title = foremost + queried + tagged + suffix;
        return title;
      }

      function getQuery (starts, terms, queryPrefix) {
        if (terms.length === 0) {
          return '';
        }
        if (queryPrefix && !starts) {
          queryPrefix = queryPrefix[0].toLowerCase() + queryPrefix.slice(1);
        }
        return textService.format('%s“%s” in ', queryPrefix, terms.join('”, “'));
      }

      function getTagPrefix (starts, tags) {
        if (extras.tags.length === 0) {
          return starts ? 'Articles' : 'articles';
        }
        return extras.tags.reduce(toTagPrefix, '') + ' articles';
        function toTagPrefix (prefix, tag) {
          var index = tags.indexOf(tag.slug);
          tags.splice(index, 1);
          if (!prefix.length) {
            return tag.titleText;
          }
          return prefix + ', ' + tag.titleText;
        }
      }

      function getTagSuffix (tags) {
        if (tags.length) {
          return textService.format(' tagged “%s”', tags.join('”, “'));
        }
        return '';
      }
    }
  }

  function toTagModel (tag) {
    return {
      slug: tag.slug,
      titleHtml: tag.titleHtml,
      descriptionHtml: tag.descriptionHtml
    };
  }
}

module.exports = factory;
