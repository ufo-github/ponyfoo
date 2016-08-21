'use strict';

const validator = require(`validator`);
const subscriberService = require(`../../../services/subscriber`);
const markupService = require(`../../../services/markup`);

module.exports = function (req, res) {
  const { topic, subject, body } = req.body;
  let { teaser } = req.body;

  if (invalid()) {
    return;
  }

  const rawBody = markupService.compile(body, { absolutize: true });

  subscriberService.send({
    topic,
    template: `raw`,
    model: {
      subject,
      teaser,
      rawBody
    }
  });
  res.json({});

  function invalid () {
    const messages = [];
    if (!validator.isLength(subject, 4)) {
      messages.push(`The email subject is way too short!`);
    }
    if (!validator.isLength(teaser, 4)) {
      teaser = subject;
    }
    if (!validator.isLength(body, 10)) {
      messages.push(`The email body should have some substance, don’t you think?`);
    }
    if (messages.length) {
      res.status(400).json({ messages });
      return true;
    }
  }
};
