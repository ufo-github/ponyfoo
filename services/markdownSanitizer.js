'use strict'

const insane = require(`insane`)
const domains = [
  /^(https?:)?\/\/codepen\.io\//i,
  /^(https?:)?\/\/assets\.codepen\.io\//i,
  /^https:\/\/www\.youtube\.com\//i,
  /^https:\/\/player\.vimeo\.com\//i
]

const customizationClasses = [
  `mde-text-left`,
  `mde-text-center`,
  `mde-text-right`,
  `mde-size-small`,
  `mde-size-large`,
  `mde-size-giant`,
  `mde-clearfix`,
  `mde-quote`,
  `mde-core`,
  `mde-mono`,
  `mde-heading`,
  `mde-subheading`,
  `mde-inline`,
  `mde-left`,
  `mde-right`,
  `mde-pad-0`,
  `mde-pad-5`,
  `mde-pad-10`,
  `mde-pad-15`,
  `mde-pad-20`,
  `mde-pad-25`,
  `mde-pad-30`,
  `mde-pad-50`,
  `mde-mar-0`,
  `mde-mar-5`,
  `mde-mar-10`,
  `mde-mar-15`,
  `mde-mar-20`,
  `mde-mar-25`,
  `mde-mar-30`,
  `mde-mar-50`,
  `mde-20`,
  `mde-25`,
  `mde-33`,
  `mde-50`,
  `mde-66`,
  `mde-75`,
  `c-oreilly-teal`,
  `c-yellow-highlight`,
  `c-dark-orange`,
  `c-pink`,
  `c-purple`,
  `c-blue`,
  `c-dark-turquoise`,
  `c-dark-green`,
  `c-white`,
  `c-bg-oreilly-teal`,
  `c-bg-yellow-highlight`,
  `c-bg-dark-orange`,
  `c-bg-pink`,
  `c-bg-purple`,
  `c-bg-blue`,
  `c-bg-dark-turquoise`,
  `c-bg-dark-green`,
  `c-bg-white`
]

const options = {
  filter: filter,
  allowedTags: insane.defaults.allowedTags.concat(`iframe`, `script`, `figure`, `figcaption`),
  allowedAttributes: {
    script: [`src`, `async`],
    p: [`data-height`, `data-theme-id`, `data-slug-hash`, `data-default-tab`, `data-user`],
    iframe: [`src`, `width`, `height`, `webkitallowfullscreen`, `mozallowfullscreen`, `allowfullscreen`]
  },
  allowedClasses: {
    div: customizationClasses,
    p: [`codepen`],
    blockquote: [`twitter-tweet`],
    figure: [`twitter-tweet-figure`],
    img: [`tj-emoji`]
  }
}

function attr (token, name) {
  if (token[name]) {
    return token[name]
  }
  if (!token.attrs) {
    return null
  }
  if (token.attrs[name]) {
    return token.attrs[name]
  }
  let i = 0
  const len = token.attrs.length
  for (; i < len; i++) {
    if (token.attrs[i][0] === name) {
      return token.attrs[i][1]
    }
  }
  return null
}

function startsWithValidDomain (href) {
  return domains.some(starts)
  function starts (reg) {
    return href && reg.test(href)
  }
}

function filter (token) {
  const unsourced = token.tag !== `iframe` && token.tag !== `script`
  return unsourced || startsWithValidDomain(attr(token, `src`))
}

module.exports = {
  options,
  startsWithValidDomain,
  attr
}
