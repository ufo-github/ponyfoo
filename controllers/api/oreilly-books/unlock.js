'use strict';

function unlock (req, res) {
  const { slug } = req.params;
  const { chapter } = req.query;
  req.flash(`passportUnlockCode`, `/books/${slug}`);
  req.flash(`passportSuccessRedirect`, `/books/${slug}/chapters/${chapter}#read`);
  res.redirect(`/account/login/twitter`);
}

module.exports = unlock;
