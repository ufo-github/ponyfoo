'use strict';

const env = require(`../../lib/env`);
const passport = require(`passport`);
const twitterStrategy = require(`passport-twitter`).Strategy;
const facebookStrategy = require(`passport-facebook`).Strategy;
const githubStrategy = require(`passport-github`).Strategy;
const googleStrategy = require(`passport-google-oauth`).OAuth2Strategy;
const linkedinStrategy = require(`passport-linkedin`).Strategy;

module.exports = {
  passport,
  authority: env(`AUTHORITY`),
  success: `/`,
  login: `/account/login`,
  local: `/account/login/local`,
  logout: `/account/logout`,
  providers: {
    facebook: {
      get enabled () { return this.id && this.secret; },
      strategy: facebookStrategy,
      protocol: `oauth2`,
      id: env(`FACEBOOK_APP_ID`),
      secret: env(`FACEBOOK_APP_SECRET`),
      link: `/account/login/facebook`,
      callback: `/account/login/facebook/callback`,
      options: { scope: `email` },
      extras: {
        profileFields: [`id`, `displayName`, `email`]
      },
      name: `Facebook`,
      css: `fa fa-facebook`
    },
    twitter: {
      get enabled () { return this.id && this.secret; },
      strategy: twitterStrategy,
      protocol: `oauth1`,
      id: env(`USER_TWITTER_CONSUMER_KEY`),
      secret: env(`USER_TWITTER_CONSUMER_SECRET`),
      link: `/account/login/twitter`,
      callback: `/account/login/twitter/callback`,
      name: `Twitter`,
      css: `fa fa-twitter`,
      extras: {
        includeEmail: true,
        preserveToken: true
      },
      options: { scope: [`include_email=true`] }
    },
    github: {
      get enabled () { return this.id && this.secret; },
      strategy: githubStrategy,
      protocol: `oauth2`,
      id: env(`GITHUB_CLIENT_ID`),
      secret: env(`GITHUB_CLIENT_SECRET`),
      link: `/account/login/github`,
      callback: `/account/login/github/callback`,
      name: `GitHub`,
      css: `fa fa-github`
    },
    google: {
      get enabled () { return this.id && this.secret; },
      strategy: googleStrategy,
      protocol: `oauth2`,
      id: env(`GOOGLE_CLIENT_ID`),
      secret: env(`GOOGLE_CLIENT_SECRET`),
      link: `/account/login/google`,
      callback: `/account/login/google/callback`,
      options: { scope: `openid email` },
      name: `Google`,
      css: `fa fa-google`
    },
    linkedin: {
      get enabled () { return this.id && this.secret; },
      strategy: linkedinStrategy,
      protocol: `oauth1`,
      id: env(`LINKEDIN_API_KEY`),
      secret: env(`LINKEDIN_API_SECRET`),
      link: `/account/login/linkedin`,
      callback: `/account/login/linkedin/callback`,
      fields: [`id`, `first-name`, `last-name`, `email-address`],
      options: { scope: [`r_basicprofile`, `r_emailaddress`] },
      name: `LinkedIn`,
      css: `fa fa-linkedin`
    }
  }
};
