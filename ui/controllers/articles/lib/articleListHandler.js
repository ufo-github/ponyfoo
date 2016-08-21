'use strict';

const tagService = require(`../../../services/tag`);
const textService = require(`../../../services/text`);
const articleService = require(`../../../services/article`);
const metadataService = require(`../../../services/metadata`);
const inliningService = require(`../../../services/inlining`);

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
    const model = res.viewModel.model;
    if (!model.action) {
      model.action = `articles/articles`;

      if (articles.length === 0 && options.skip !== false) {
        res.viewModel.skip = true;
        next(); return;
      }
    }

    const keywords = metadataService.mostCommonTags(articles);
    const expanded = articleService.expandForListView(articles);
    model.articles = expanded.articles;
    model.meta.keywords = keywords;
    model.meta.images = expanded.extracted.images;

    if (extras) {
      if (extras.tags) {
        model.tags = extras.tags.map(tagService.toKnownTagModel);
      }
    }

    if (`queryTerms` in options && `queryTags` in options) {
      setSearchResultsMetadata();
    }

    inliningService.addStyles(model, options.search ? `search` : `summaries`);
    next();

    function setSearchResultsMetadata () {
      model.title = getTitle({
        standalone: true
      });
      model.queryTitle = getTitle({
        standalone: true,
        hasSuffix: false,
        forcedPrefix: `Your query for `
      });
      model.meta.description = `This search results page contains all of the ` + getTitle({
        standalone: false
      });

      function getTitle (ctx) {
        // '[Your query for ${terms} in ][${knownTags} ]articles[ tagged ${otherTags}]'
        // '[Search results for ${terms} in ][${knownTags} ]articles[ tagged ${otherTags}]'
        const foremost = ctx.forcedPrefix || ``;
        const queryPrefix = foremost ? `` : `Search results for `;
        const suffix = ctx.hasSuffix === false ? `` : ` on Pony Foo`;
        const terms = options.queryTerms.slice();
        const tags = options.queryTags.slice();
        const hasNoPrefix = ctx.standalone && foremost.length === 0;
        const hasNoPrefixOrTerms = hasNoPrefix && terms.length === 0;
        const queried = getQuery(hasNoPrefix, terms, queryPrefix);
        const tagged = getTagPrefix(hasNoPrefixOrTerms, tags) + getTagSuffix(tags);
        const title = foremost + queried + tagged + suffix;
        return title;
      }

      function getQuery (starts, terms, queryPrefix) {
        if (terms.length === 0) {
          return ``;
        }
        if (queryPrefix && !starts) {
          queryPrefix = queryPrefix[0].toLowerCase() + queryPrefix.slice(1);
        }
        return textService.format(`%s“%s” in `, queryPrefix, terms.join(` `));
      }

      function getTagPrefix (starts, tags) {
        if (extras.tags.length === 0) {
          return starts ? `Articles` : `articles`;
        }
        return extras.tags.reduce(toTagPrefix, ``) + ` articles`;
        function toTagPrefix (prefix, tag) {
          const index = tags.indexOf(tag.slug);
          tags.splice(index, 1);
          if (!prefix.length) {
            return tag.titleText;
          }
          return prefix + `, ` + tag.titleText;
        }
      }

      function getTagSuffix (tags) {
        if (tags.length) {
          return textService.format(` tagged “%s”`, tags.join(`”, “`));
        }
        return ``;
      }
    }
  }
}

module.exports = factory;
