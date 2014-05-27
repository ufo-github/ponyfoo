'use strict';

var env = require('../../lib/env');

module.exports = {
  success: '/',
  login: '/authentication/login',
  logout: '/authentication/logout',
  local: '/authentication/login/local',
  facebook: {
    get enabled () { return this.id && this.secret; },
    id: env('FACEBOOK_APP_ID'),
    secret: env('FACEBOOK_APP_SECRET'),
    link: '/authentication/login/facebook',
    callback: '/authentication/login/facebook/callback'
  },
  github: {
    get enabled () { return this.id && this.secret; },
    id: env('GITHUB_CLIENT_ID'),
    secret: env('GITHUB_CLIENT_SECRET'),
    link: '/authentication/login/github',
    callback: '/authentication/login/github/callback'
  },
  google: {
    enabled: true,
    link: '/authentication/login/google',
    callback: '/authentication/login/google/callback'
  },
  linkedin: {
    get enabled () { return this.id && this.secret; },
    id: env('LINKEDIN_API_KEY'),
    secret: env('LINKEDIN_API_SECRET'),
    link: '/authentication/login/linkedin',
    callback: '/authentication/login/linkedin/callback'
  }
};
