'use strict';

const topicTexts = {
  articles: `emails about articles and comments`,
  newsletter: `our newsletter`
};
const listNames = {
  articles: `articles & comments mailing list`
};

module.exports = function (req, res, next) {
  const topic = req.query.topic;
  const topicText = topic ? topicTexts[topic] || topic : `our mailing list`;
  const description = `You’ve successfully unsubscribed from ` + topicText + `!`;
  const listName = listNames[topic] || topic;

  res.viewModel = {
    model: {
      title: `Unsubscribed! \u2014 Pony Foo`,
      topic: topic,
      listName: listName,
      description: description,
      hash: req.query.hash,
      meta: {
        canonical: `/unsubscribed`
      }
    }
  };
  next();
};
