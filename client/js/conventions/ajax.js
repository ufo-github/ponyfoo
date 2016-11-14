'use strict'

const $ = require(`dominus`)
const taunus = require(`taunus`)
const measly = require(`measly`)
const defaultMessages = [`Oops. It seems something went terribly wrong!`]
const body = $(`body`)

body.on(`click`, `.vw-conventional, .fs-messages`, remove)

function conventions () {
  measly.on(`data`, renderOrClean)
  measly.on(`error`, render)
  taunus.on(`render`, createLayer)
  taunus.on(`change`, abort)
  taunus.on(`fetch.error`, handleTaunusError)
}

function createLayer (container, viewModel) {
  viewModel.measly = measly.layer({ context: container })
}

function abort () {
  measly.abort()
}

function remove (e) {
  e.preventDefault()
  const ctx = $(e.target)
  const parents = ctx.parents(`.vw-conventional, .fs-messages`)
  ctx.and(parents).remove()
}

function clean (context) {
  context.find(`.vw-conventional`).remove()
}

function renderOrClean (data) {
  if (data.messages) {
    render.call(this, null, data); return
  }
  const context = $(this.context)
  clean(context)
}

function getMessages (err, body) {
  if (err) {
    return defaultMessages
  }
  const singleMessage = body && body.error && body.error.message
  if (singleMessage) {
    return [singleMessage]
  }
  if (body) {
    return body.messages || defaultMessages
  }
  return defaultMessages
}

function render (err, body) {
  if (this.aborted) {
    return
  }
  const messages = getMessages(err, body)
  if (messages === void 0) {
    return
  }
  const context = $(this.context)
  const list = $(`<ul>`).addClass(`vw-conventional`)

  $(messages.map(dom)).appendTo(list).i(0).append(
    $(`<span>`).addClass(`fa fa-remove vw-conventional-remove`)
  )

  clean(context)

  const title = context.findOne(`.vw-title`)
  if (title) {
    $(title).after(list)
  } else {
    context.i(0).prepend(list)
  }

  list[0].scrollIntoView()

  global.scrollBy(0, -100)
}

function handleTaunusError (route, context, err) {
  const ctx = $(context.element)
  const parents = ctx.parents(`.ly-section`)
  const section = ctx.where(`.ly-section`).and(parents)
  if (section.length) {
    render.call({ context: section.length ? section : document.body }, err, {
      messages: defaultMessages
    })
  }
}

function dom (message) {
  return $(`<li>`).text(message).addClass(`vw-conventional-message`)[0]
}

module.exports = conventions
