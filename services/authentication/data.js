'use strict';

var env = require('../../lib/env');

module.exports = {
  success: '/',
  login: '/user/login',
  logout: '/user/logout',
  email: '/user/login/email',
  facebook: {
    get enabled () { return this.id && this.secret; },
    id: env('FACEBOOK_APP_ID'),
    secret: env('FACEBOOK_APP_SECRET'),
    link: '/user/login/facebook',
    callback: '/user/login/facebook/callback'
  },
  github: {
    get enabled () { return this.id && this.secret; },
    id: env('GITHUB_CLIENT_ID'),
    secret: env('GITHUB_CLIENT_SECRET'),
    link: '/user/login/github',
    callback: '/user/login/github/callback'
  },
  google: {
    enabled: true,
    link: '/user/login/google',
    callback: '/user/login/google/callback'
  },
  linkedin: {
    get enabled () { return this.id && this.secret; },
    id: env('LINKEDIN_API_KEY'),
    secret: env('LINKEDIN_API_SECRET'),
    link: '/user/login/linkedin',
    callback: '/user/login/linkedin/callback'
  }
};
