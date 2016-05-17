'use strict';

var correcthorse = require('correcthorse');
var WeeklyIssue = require('../../../models/WeeklyIssue');
var weeklyCompilerService = require('../../../services/weeklyCompiler');
var datetimeService = require('../../../services/datetime');

module.exports = function (req, res, next) {
  var slug = req.params.slug;
  if (slug) {
    WeeklyIssue.findOne({ slug: slug }).lean().exec(find);
  } else {
    setModel();
    next();
  }

  function find (err, issue) {
    if (err) {
      next(err); return;
    }
    if (!issue) {
      res.status(404).json({ messages: ['Weekly issue not found'] }); return;
    }
    setModel(issue);
    next();
  }

  function setModel (issue) {
    var defaults = {
      status: 'draft',
      slug: correcthorse(),
      summary: [
        'We\'re glad you could make it this week! 💌',
        '',
        'If you have any tips, feel free to email us at [tips@ponyfoo.com][tips] _-- or just reply to this email._ You can leave comments on the website.',
        '',
        '[tips]: mailto:tips@ponyfoo.com'
      ].join('\n'),
      sections: [{
        type: 'header',
        text: 'Example Header'
      }, {
        type: 'link',
        title: 'Example link #1',
        href: 'https://example.com/1/',
        sourceHref: 'https://twitter.com/'
      }, {
        type: 'link',
        title: 'Example link #2',
        href: 'https://example.com/2/',
        sourceHref: 'https://twitter.com/'
      }, {
        type: 'header',
        text: 'Helping Hands Wanted',
        foreground: '#f3f3f3',
        background: '#1a4d7f'
      }, {
        type: 'markdown',
        text: [
          'Sponsorship opportunities! [Check out our media kit][kit] and reach us at: [sponsor@ponyfoo.com][sponsor].',
          '',
          '[Become a patron][patron] and get the newsletter a full day earlier!',
          '',
          'Feel free to send interesting links our way: [tips@ponyfoo.com][tips].',
          '',
          '[kit]: /weekly/sponsor',
          '[patron]: https://www.patreon.com/bevacqua',
          '[sponsor]: mailto:sponsor@ponyfoo.com',
          '[tips]: mailto:tips@ponyfoo.com'
        ].join('\n')
      }]
    };
    var issueModel = issue || defaults;
    issueModel.publication = datetimeService.field(issueModel.publication || new Date());
    res.viewModel = {
      model: {
        title: 'Weekly Assembler \u2014 Pony Foo',
        issue: issueModel,
        editing: !!slug,
        knownTags: weeklyCompilerService.knownTags
      }
    };
  }
};
