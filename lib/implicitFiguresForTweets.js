'use strict';

function implicitFiguresForTweets (md) {
  md.core.ruler.push(`implicit_figures_for_tweets`, implicitFiguresForTweetsPlugin);

  function implicitFiguresForTweetsPlugin (state) {
    const rtweet = /^<blockquote class=["']twitter-tweet["']/i;
    const { length } = state.tokens;

    for (let i = 0; i < length; ++i) {
      const token = state.tokens[i];

      if (token.type !== `html_block`) { continue; }
      if (!rtweet.test(token.content)) { continue; }

      token.content = `<figure class='twitter-tweet-figure'>${token.content}</figure>`;
    }
  }
}

module.exports = implicitFiguresForTweets;
