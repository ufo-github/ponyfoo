'use strict';

var env = require('../../lib/env');

module.exports = {
  passport: require('passport'),
  authority: env('AUTHORITY'),
  success: '/',
  login: '/account/login',
  logout: '/account/logout',
  local: '/account/login/local',
  providers: {
    facebook: {
      get enabled () { return this.id && this.secret; },
      strategy: require('passport-facebook').Strategy,
      protocol: 'oauth2',
      id: env('FACEBOOK_APP_ID'),
      secret: env('FACEBOOK_APP_SECRET'),
      link: '/account/login/facebook',
      callback: '/account/login/facebook/callback',
      options: { scope: 'email' }
    },
    github: {
      get enabled () { return this.id && this.secret; },
      strategy: require('passport-github').Strategy,
      id: env('GITHUB_CLIENT_ID'),
      protocol: 'oauth2',
      secret: env('GITHUB_CLIENT_SECRET'),
      link: '/account/login/github',
      callback: '/account/login/github/callback'
    },
    google: {
      get enabled () { return this.id && this.secret; },
      strategy: require('passport-google-oauth').OAuth2Strategy,
      id: env('GOOGLE_CLIENT_ID'),
      protocol: 'oauth2',
      secret: env('GOOGLE_CLIENT_SECRET'),
      link: '/account/login/google',
      callback: '/account/login/google/callback',
      options: { scope: 'openid email' }
    },
    linkedin: {
      get enabled () { return this.id && this.secret; },
      strategy: require('passport-linkedin').Strategy,
      protocol: 'oauth1',
      id: env('LINKEDIN_API_KEY'),
      secret: env('LINKEDIN_API_SECRET'),
      link: '/account/login/linkedin',
      callback: '/account/login/linkedin/callback',
      fields: ['id', 'first-name', 'last-name', 'email-address'],
      options: { scope: ['r_basicprofile', 'r_emailaddress'] }
    }
  }
};
