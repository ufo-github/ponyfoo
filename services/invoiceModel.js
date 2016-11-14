'use strict'

const moment = require(`moment`)
const sluggish = require(`sluggish`)
const numberService = require(`./number`)
const datetimeService = require(`./datetime`)
const markdownService = require(`./markdown`)

function generateModel (data) {
  const date = moment.utc(data.date)
  const items = data.items.map(generateItem)
  const total = items.reduce(sum, 0)
  const slug = getSlug(data)
  return {
    slug: slug,
    date: datetimeService.field(date),
    customer: generatePartyModel(data.customer, data.customerParty),
    payment: generatePartyModel(data.payment, data.paymentParty),
    items: items,
    paid: `paid` in data ? data.paid : false,
    total: total,
    totalMoney: numberService.toMoney(total)
  }
}

function generatePartyModel (party, template) {
  if (!party) {
    if (template) {
      return generatePartyModel(template)
    }
    return party
  }
  const p = party || {}
  const t = template || {}
  const name = p.name || t.name
  const details = p.details || t.details
  return {
    name: name,
    nameHtml: markdownService.compile(name),
    details: details,
    detailsHtml: markdownService.compile(details)
  }
}

function getSlug (data) {
  if (data.slug) {
    return data.slug
  }
  if (!data.customer) {
    return ``
  }
  const customerSlug = sluggish(data.customer.name)
  const datestamp = moment.utc(data.date).format(`YYMMDD`)
  return customerSlug + `-` + datestamp
}

function sum (accumulator, item) {
  return accumulator + item.price
}

function generateItem (item) {
  const summary = item.summary || `_(no description)_`
  const amount = item.amount || 1
  const rate = item.rate || 0
  const price = amount * rate
  return {
    summary: summary,
    summaryHtml: markdownService.compile(summary),
    amount: amount,
    price: price,
    priceMoney: numberService.toMoney(price),
    rate: rate,
    rateMoney: numberService.toMoney(rate)
  }
}

module.exports = {
  generateModel: generateModel
}
