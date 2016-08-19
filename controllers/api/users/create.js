'use strict';

const winston = require(`winston`);
const sluggish = require(`sluggish`);
const validator = require(`validator`);
const markupService = require(`../../../services/markup`);
const summaryService = require(`../../../services/summary`);
const bioService = require(`../../../services/bio`);
const User = require(`../../../models/User`);
const rprotocol = /^https?:\/\//i;
const rtwitter = /^https?:\/\/twitter\.com\//i;
const rtwitter_legacy = /[@#!]+/i;

module.exports = function (req, res, next) {
  const body = req.body;
  const bio = validator.toString(body.bio);
  const bioHtml = markupService.compile(bio, { deferImages: true });
  const bioText = summaryService.summarize(bioHtml, 200).text;
  const displayName = body.displayName;
  if (displayName.length < 4) {
    res.status(400).json({ messages: [`The name must be at least 4 characters long.`] }); return;
  }
  const slug = sluggish(body.slug);
  if (slug.length < 4) {
    res.status(400).json({ messages: [`The username must be at least 4 characters long.`] }); return;
  }
  const password = validator.toString(body.password);
  if (password.length < 4) {
    res.status(400).json({ messages: [`The password must be at least 4 characters long.`] }); return;
  }
  const validEmail = validator.isEmail(body.email);
  if (!validEmail) {
    res.status(400).json({ messages: [`Use a valid email address.`] }); return;
  }
  if (body.roles.length < 1) {
    res.status(400).json({ messages: [`The user must have some role.`] }); return;
  }
  const user = {};
  user.email = body.email;
  user.password = password;
  user.bypassEncryption = false;
  user.displayName = displayName;
  user.slug = slug;
  user.twitter = parseTwitter(body.twitter);
  user.website = parseLink(body.website);
  user.avatar = parseLink(body.avatar);
  user.roles = body.roles;
  user.bio = bio;
  user.bioHtml = bioHtml;
  user.bioText = bioText;
  new User(user).save(saved);

  function parseTwitter (value) {
    if (!value) {
      return null;
    }
    return value
      .replace(rtwitter, ``)
      .replace(rtwitter_legacy, ``);
  }

  function parseLink (value) {
    if (!value) {
      return null;
    }
    if (!rprotocol.test(value)) {
      return `http://` + value;
    }
    return value;
  }

  function saved (err, user) {
    if (err) {
      next(err); return;
    }
    winston.info(`Created an account for ${ user.email }`);
    bioService.update(user.email, bio, bioHtml, bioText);
    res.json({});
  }
};
