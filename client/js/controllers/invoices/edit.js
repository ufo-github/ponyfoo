'use strict';

var $ = require('dominus');
var raf = require('raf');
var moment = require('moment');
var taunus = require('taunus');
var assign = require('assignment');
var sluggish = require('sluggish');
var find = require('lodash/collection/find');
var debounce = require('lodash/function/debounce');
var loadScript = require('../../lib/loadScript');
var invoiceModelService = require('../../../../services/invoiceModel');

module.exports = function (viewModel, container, route) {
  loadScript('/js/rome.js', function loaded () {
    var editing = viewModel.editing;
    var date = $('.ive-date');
    var slug = $('.ive-slug');
    var customerName = $('.ive-customer-name');
    var addItem = $('.ive-add-item');
    var items = $('.ive-items');
    var form = $('.ig-form');
    var boundSlug = !editing;
    var typingSlugSlowly = raf.bind(null, debounce(typingSlug, 100));
    var typingDateSlowly = raf.bind(null, debounce(typingDate, 100));
    var typingCustomerSlowly = raf.bind(null, debounce(typingCustomer, 100));
    var updatePreviewSlowly = raf.bind(null, debounce(updatePreview, 100));

    rome(date[0], { time: false, inputFormat: 'DD-MM-YYYY' }).on('data', typingDateSlowly);

    slug.on('keypress keydown paste input', typingSlugSlowly);
    date.on('keypress keydown paste input', typingDateSlowly);
    customerName.on('keypress keydown paste input', typingCustomerSlowly);
    addItem.on('click', appendItemPartial);
    updatePreview();

    $('.ig-container')
      .on('keypress keydown paste input change', 'input,textarea', updatePreviewSlowly)
      .on('click', '.ive-item-remove', removeItem);

    $('.ive-save').on('click', save);
    $('.ive-customer-frequent').on('change', prefilledPartyHandler('customer'));
    $('.ive-payment-frequent').on('change', prefilledPartyHandler('payment'));

    function typingSlug () { boundSlug = false; updatePreviewSlowly(); }
    function typingDate () { updateSlug(); }
    function typingCustomer () { updateSlug(); }

    function updateSlug () {
      slug.value(getSlug());
      updatePreviewSlowly();
    }

    function getSlug () {
      var companySlug = sluggish(customerName.value());
      var datestamp = moment(date.value(), 'DD-MM-YYYY').format('YYMMDD');
      var slug = companySlug + '-' + datestamp;
      return slug;
    }

    function prefilledPartyHandler (party) {
      return setParty;
      function setParty (e) {
        var el = $(e.target);
        var slug = el.value();
        var item = find(viewModel.parties[party], { slug: slug });
        var section = el.parents('.ive-party-section');
        var name = section.find('.ive-party-name');
        var details = section.find('.ive-party-details');
        if (item) {
          name.value(item.name);
          details.value(item.details);
        } else {
          name.value('');
          details.value('');
        }
        el.value('');
        updatePreviewSlowly();
      }
    }

    function appendItemPartial () {
      taunus.partial.appendTo(items[0], 'invoices/add-item', {
        item: {
          summary: '',
          amount: 1,
          rate: ''
        }
      });
      updatePreviewSlowly();
    }

    function removeItem (e) {
      $(e.target).parents('.ive-item-container').remove();
      updatePreviewSlowly();
    }

    function getModel () {
      var model = {
        date: moment(date.value(), 'DD-MM-YYYY').toDate(),
        slug: slug.value(),
        customer: {
          name: $('.ive-from .ive-customer-name').value(),
          details: $('.ive-from .ive-customer-details').value()
        },
        payment: {
          name: $('.ive-to .ive-payment-name').value(),
          details: $('.ive-to .ive-payment-details').value()
        },
        items: $('.ive-item-container').map(toItemModel),
        paid: $('.ive-paid').value()
      };
      if (editing) {
        if (viewModel.invoice.customerParty) {
          model.customerParty = assign({}, viewModel.invoice.customerParty);
        }
        if (viewModel.invoice.paymentParty) {
          model.paymentParty = assign({}, viewModel.invoice.paymentParty);
        }
      }
      return model;
      function toItemModel (el) {
        return {
          summary: $('.ive-item-summary', el).value(),
          amount: parseFloat($('.ive-item-amount', el).value()),
          rate: parseFloat($('.ive-item-rate', el).value()),
        };
      }
    }

    function updatePreview () {
      var el = $.findOne('.ive-container');
      var model = getModel();
      model.customer.details = model.customer.details;
      model.payment.details = model.payment.details;
      var invoice = invoiceModelService.generateModel(model);
      var vm = {
        invoice: invoice,
        editing: editing
      };
      taunus.partial(el, 'invoices/invoice', vm);
    }

    function save (e) {
      e.preventDefault();
      var endpoint = form.attr('action');
      var invoice = getModel();
      var data = {
        json: {
          invoice: invoice
        }
      };
      viewModel.measly.post(endpoint, data).on('data', leave);
    }

    function leave () {
      taunus.navigate('/invoices');
    }
  });
};
