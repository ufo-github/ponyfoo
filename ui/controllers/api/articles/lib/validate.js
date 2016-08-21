'use strict';

const util = require(`util`);
const moment = require(`moment`);
const sluggish = require(`sluggish`);
const validator = require(`validator`);
const Article = require(`../../../../models/Article`);
const textService = require(`../../../../services/text`);
const statuses = Article.validStatuses;

function validate (model, options) {
  const validation = [];
  if (!model || typeof model !== `object`) {
    validation.push(`Invalid request.`);
    return validation;
  }
  const status = getStatus();
  const draft = status === `draft`;
  const sanitized = {
    status: status,
    titleMarkdown: getTitle(),
    slug: getSlug(),
    summary: validator.toString(model.summary),
    teaser: getContent(`teaser`, { required: !draft }),
    introduction: getContent(`introduction`, { required: !draft }),
    body: getContent(`body`, { required: !draft }),
    tags: draft ? getTagsRaw() : getTags(),
    heroImage: validator.toString(model.heroImage).trim(),
    comments: [],
    related: [],
    email: !!model.email,
    tweet: !!model.tweet,
    fb: !!model.fb,
    echojs: !!model.echojs,
    hn: !!model.hn
  };
  if (options.hasAuthor) {
    sanitized.author = getAuthor();
  }
  const publication = getPublicationDate();
  if (publication) {
    sanitized.publication = publication;
  } else if (model.status !== `published`) {
    sanitized.publication = void 0;
  }
  if (options.editor && !options.originalAuthor) { // prevent drafters from overwriting data they can't see
    sanitized.editorNote = getContent(`editorNote`, { required: false });
  }
  if (options.update) {
    delete sanitized.comments;
    delete sanitized.related;
    if (!options.editor) { // prevent drafters from overwriting data they can't see
      delete sanitized.email;
      delete sanitized.tweet;
      delete sanitized.fb;
      delete sanitized.echojs;
      delete sanitized.hn;
    }
  }
  validation.model = sanitized;
  return validation;

  function getAuthor () {
    if (!options.author) {
      validation.push(`The author doesn't exist. Maybe it was deleted or demoted?`);
      return null;
    }
    return options.author._id;
  }
  function getPublicationDate () {
    if (model.publication && model.status !== `published`) {
      const when = moment.utc(model.publication);
      if (!when.isValid()) {
        validation.push(`The publication date is invalid.`);
      }
      if (when.isBefore(moment.utc())) {
        validation.push(`Pick a publication date in the future. I don’t have superpowers.`);
      }
      return when.toDate();
    }
  }

  function getStatus () {
    if (statuses.indexOf(model.status) !== -1) {
      return validator.toString(model.status);
    }
    validation.push(`The provided status is invalid.`);
  }

  function getTitle () {
    const length = 3;
    if (validator.isLength(model.titleMarkdown, length)) {
      return validator.toString(model.titleMarkdown);
    }
    const message = util.format(`The title must be at least %s characters long.`, length);
    validation.push(message);
  }

  function getSlug () {
    const length = 3;
    const input = validator.toString(model.slug);
    const slug = sluggish(input);
    if (!validator.isLength(slug, length)) {
      const message = util.format(`The article slug must be at least %s characters long.`, length);
      validation.push(message);
    }
    const rforbidden = /^feed|archives|history$/ig;
    if (rforbidden.test(slug)) {
      validation.push(`The provided slug is reserved and can’t be used`);
    }
    return slug;
  }

  function getContent (prop, options) {
    const length = 3;
    let message;
    const input = validator.toString(model[prop]);
    if (!validator.isLength(input, length)) {
      message = util.format(`The article %s must be at least %s characters long.`, prop, length);
      if (options.required) {
        validation.push(message);
      }
    }
    const rimgur = /http:\/\/i\.imgur\.com\//g;
    return input.replace(rimgur, `https://i.imgur.com/`);
  }

  function getTags () {
    const raw = getTagsRaw();
    if (raw.length > 6) {
      validation.push(`You can choose 6 categories at most.`); return;
    }
    if (raw.length === 0) {
      validation.push(`The article must be tagged under at least one category.`); return;
    }
    return raw;
  }

  function getTagsRaw () {
    const input = Array.isArray(model.tags) ? model.tags.join(` `) : validator.toString(model.tags);
    const tags = textService.splitTags(input);
    return tags;
  }
}

module.exports = validate;
