'use strict';

require('../preconfigure');
require('../chdir');

var moment = require('moment');
var db = require('../lib/db');
var boot = require('../lib/boot');
var WeeklyIssue = require('../models/WeeklyIssue')

boot(booted);

function booted () {
  WeeklyIssue.find({ statusReach: 'everyone' }).lean().exec(found);
}

function found (err, issues) {
  if (err) {
    throw err;
  }
  var sections = issues
    .map(issue => issue.sections)
    .reduce((all, sections) => all.concat(sections), [])
    .filter(section => section.type === 'link')
    .filter(section => section.sponsored);

  sections.forEach(section => console.log(section.href));

  console.log(`Numbers:
     Found ${sections.length} sponsored links
    Across ${issues.length} issues since ${moment(issues[0].created).format(`MMMM YYYY`)}
    Earned $${sections.length * 60}.00 in total
    Earned $${(sections.length * 60 / issues.length).toFixed(2)} per issue on average`);

  end();
}

function end () {
  db.disconnect(() => process.exit(0));
}
