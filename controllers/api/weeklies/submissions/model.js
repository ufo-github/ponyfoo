'use strict'

const WeeklyIssueSubmission = require(`../../../../models/WeeklyIssueSubmission`)
const weeklySubmissionService = require(`../../../../services/weeklySubmission`)

function model (req, res, next) {
  const query = { slug: req.params.slug }
  WeeklyIssueSubmission.findOne(query).exec(found)

  function found (err, submission) {
    if (err) {
      next(err); return
    }
    if (!submission) {
      res.status(404).json({ messages: [`Weekly submission not found`] }); return
    }
    res.json(weeklySubmissionService.toSubmissionModel(submission))
  }
}

module.exports = model
