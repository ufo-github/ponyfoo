'use strict';

require('../preconfigure');
require('../chdir');

const moment = require('moment');
const db = require('../lib/db');
const boot = require('../lib/boot');
const WeeklyIssue = require('../models/WeeklyIssue');

boot(booted);

function booted () {
  WeeklyIssue.find({ statusReach: 'everyone' }).lean().exec(found);
}

function found (err, issues) {
  if (err) {
    throw err;
  }
  const sections = issues
    .map(issue => issue.sections.map(section => {
      section.issue = issue;
      return section;
    }))
    .reduce((all, sections) => all.concat(sections), [])
    .filter(section => section.type === 'link')
    .filter(section => section.sponsored);

  sections.forEach(section => console.log(section.href));

  console.log(`Numbers:
     Found ${sections.length} sponsored links
    Across ${issues.length} issues since ${moment.utc(issues[0].created).format('MMMM YYYY')}
    Earned $${sum(sections).toFixed(2)} in total
    Earned $${(sum(sections) / issues.length).toFixed(2)} per issue on average`);

  end();
}

function sum (sections) {
  return sections.reduce((total, section) => total + price(section), 0);
}

function price (section) {
  if (before('2016-07-28')) {
    return 60;
  }
  return 70;

  function before (date) {
    return moment.utc(section.issue.publication).isBefore(moment.utc(date, 'YYYY-MM-DD'));
  }
}

function end () {
  db.disconnect(() => process.exit(0));
}
