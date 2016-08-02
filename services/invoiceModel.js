'use strict';

var moment = require('moment');
var assign = require('assignment');
var sluggish = require('sluggish');
var numberService = require('./number');
var datetimeService = require('./datetime');
var markdownService = require('./markdown');

function generateModel (data) {
  var date = moment.utc(data.date);
  var items = data.items.map(generateItem);
  var total = items.reduce(sum, 0);
  var slug = getSlug(data);
  return {
    slug: slug,
    date: datetimeService.field(date),
    customer: generatePartyModel(data.customer, data.customerParty),
    payment: generatePartyModel(data.payment, data.paymentParty),
    items: items,
    paid: 'paid' in data ? data.paid : false,
    total: total,
    totalMoney: numberService.toMoney(total)
  };
}

function generatePartyModel (party, template) {
  if (!party) {
    if (template) {
      return generatePartyModel(template);
    }
    return party;
  }
  var p = party || {};
  var t = template || {};
  var name = p.name || t.name;
  var details = p.details || t.details;
  return {
    name: name,
    nameHtml: markdownService.compile(name),
    details: details,
    detailsHtml: markdownService.compile(details)
  };
}

function getSlug (data) {
  if (data.slug) {
    return data.slug;
  }
  if (!data.customer) {
    return '';
  }
  var customerSlug = sluggish(data.customer.name);
  var datestamp = moment.utc(data.date).format('YYMMDD');
  return customerSlug + '-' + datestamp;
}

function sum (accumulator, item) {
  return accumulator + item.price;
}

function generateItem (item) {
  var summary = item.summary || '_(no description)_';
  var amount = item.amount || 1;
  var rate = item.rate || 0;
  var price = amount * rate;
  return {
    summary: summary,
    summaryHtml: markdownService.compile(summary),
    amount: amount,
    price: price,
    priceMoney: numberService.toMoney(price),
    rate: rate,
    rateMoney: numberService.toMoney(rate)
  };
}

module.exports = {
  generateModel: generateModel
};
