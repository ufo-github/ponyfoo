'use strict';

var topicTexts = {
  articles: 'emails about articles and comments',
  newsletter: 'our newsletter'
};
var listNames = {
  articles: 'articles & comments mailing list'
};

module.exports = function (req, res, next) {
  var topic = req.params.topic;
  var topicText = topic ? topicTexts[topic] || topic : 'our mailing list';
  var description = 'You’ve successfully unsubscribed from ' + topicText + '!';
  var listName = listNames[topic] || topic;

  res.viewModel = {
    model: {
      title: 'Unsubscribed! \u2014 Pony Foo',
      topic: topic,
      listName: listName,
      description: description,
      hash: req.query.hash
    }
  };
  next();
}
