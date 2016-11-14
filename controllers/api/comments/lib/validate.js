'use strict'

const util = require(`util`)
const validator = require(`validator`)

function validate (model) {
  const validation = []
  if (!model || typeof model !== `object`) {
    validation.push(`Invalid request.`)
    return validation
  }
  const sanitized = {
    author: getName(),
    email: getEmail(),
    content: getContent(),
    site: getSite(),
    parent: getParent()
  }
  validation.model = sanitized

  return validation

  function getName () {
    const name = validator.toString(model.name).trim()
    if (!name) {
      validation.push(util.format(`Your name is required`))
    }
    return name
  }

  function getEmail () {
    const valid = validator.isEmail(model.email)
    if (valid === false) {
      validation.push(`Please provide a valid email address! No spam, promise!`)
    }
    return model.email
  }

  function getContent () {
    const length = 10
    const max = 60000
    const valid = validator.isLength(model.content, length)
    if (valid === false) {
      validation.push(util.format(`Comments must be at least %s characters long`, length))
    }
    const bound = validator.isLength(model.content, 0, max)
    if (bound === false) {
      validation.push(util.format(`Comments can have at most %s characters!`, length))
    }
    return model.content
  }

  function getSite () {
    const scheme = /^https?:\/\//i
    const input = validator.toString(model.site).trim()
    if (input && !validator.isURL(input)) {
      validation.push(`The site is optional, but it should be an URL`)
    }
    if (input.length === 0) {
      return null
    }
    return scheme.test(input) ? input : `http://` + input
  }

  function getParent () {
    return model.parent
  }
}

module.exports = validate
