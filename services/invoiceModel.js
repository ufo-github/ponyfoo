'use strict';

var moment = require('moment');
var assign = require('assignment');
var sluggish = require('sluggish');
var numberService = require('./number');
var datetimeService = require('./datetime');
var markdownService = require('./markdown');

function generateModel (data) {
  var date = moment(data.date);
  var items = data.items.map(generateItem);
  var total = items.reduce(sum, 0);
  var slug = getSlug(data);
  return {
    slug: slug,
    date: datetimeService.field(date),
    customer: generatePartyModel(data.customer),
    payment: generatePartyModel(data.payment),
    items: items,
    paid: 'paid' in data ? data.paid : false,
    total: total,
    totalMoney: numberService.toMoney(total)
  };
}

function generatePartyModel (party) {
  if (!party) {
    return party;
  }
  return {
    name: party.name,
    nameHtml: markdownService.compile(party.name),
    details: party.details,
    detailsHtml: markdownService.compile(party.details)
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
  var datestamp = moment(data.date).format('YYMMDD');
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
