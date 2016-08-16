'use strict';

const $ = require(`dominus`);
const raf = require(`raf`);
const moment = require(`moment`);
const taunus = require(`taunus`);
const assign = require(`assignment`);
const sluggish = require(`sluggish`);
const find = require(`lodash//find`);
const debounce = require(`lodash/debounce`);
const loadScript = require(`../../lib/loadScript`);
const invoiceModelService = require(`../../../../services/invoiceModel`);

module.exports = function (viewModel) {
  loadScript(`/js/rome.js`, function loaded () {
    const { rome } = global;
    const editing = viewModel.editing;
    const date = $(`.ive-date`);
    const slug = $(`.ive-slug`);
    const customerName = $(`.ive-customer-name`);
    const addItem = $(`.ive-add-item`);
    const items = $(`.ive-items`);
    const form = $(`.ig-form`);
    let boundSlug = !editing;
    const typingSlugSlowly = raf.bind(null, debounce(typingSlug, 100));
    const typingDateSlowly = raf.bind(null, debounce(typingDate, 100));
    const typingCustomerSlowly = raf.bind(null, debounce(typingCustomer, 100));
    const updatePreviewSlowly = raf.bind(null, debounce(updatePreview, 100));

    rome(date[0], { time: false, inputFormat: `DD-MM-YYYY` }).on(`data`, typingDateSlowly);

    slug.on(`keypress keydown paste input`, typingSlugSlowly);
    date.on(`keypress keydown paste input`, typingDateSlowly);
    customerName.on(`keypress keydown paste input`, typingCustomerSlowly);
    addItem.on(`click`, appendItemPartial);
    updatePreview();

    $(`.ig-container`)
      .on(`keypress keydown paste input change`, `input,textarea`, updatePreviewSlowly)
      .on(`click`, `.ive-item-remove`, removeItem);

    $(`.ive-save`).on(`click`, save);
    $(`.ive-customer-frequent`).on(`change`, prefilledPartyHandler(`customer`));
    $(`.ive-payment-frequent`).on(`change`, prefilledPartyHandler(`payment`));

    function typingSlug () { boundSlug = false; updatePreviewSlowly(); }
    function typingDate () { updateSlug(); }
    function typingCustomer () { updateSlug(); }

    function updateSlug () {
      if (!boundSlug) {
        return;
      }
      slug.value(getSlug());
      updatePreviewSlowly();
    }

    function getSlug () {
      const companySlug = sluggish(customerName.value());
      const datestamp = moment(date.value(), `DD-MM-YYYY`).format(`YYMMDD`);
      const slug = companySlug + `-` + datestamp;
      return slug;
    }

    function prefilledPartyHandler (party) {
      return setParty;
      function setParty (e) {
        const el = $(e.target);
        const slug = el.value();
        const item = find(viewModel.parties[party], { slug: slug });
        const section = el.parents(`.ive-party-section`);
        const name = section.find(`.ive-party-name`);
        const details = section.find(`.ive-party-details`);
        if (item) {
          name.value(item.name);
          details.value(item.details);
        } else {
          name.value(``);
          details.value(``);
        }
        el.value(``);
        updatePreviewSlowly();
      }
    }

    function appendItemPartial () {
      taunus.partial.appendTo(items[0], `invoices/add-item`, {
        item: {
          summary: ``,
          amount: 1,
          rate: ``
        }
      });
      updatePreviewSlowly();
    }

    function removeItem (e) {
      $(e.target).parents(`.ive-item-container`).remove();
      updatePreviewSlowly();
    }

    function getModel () {
      const model = {
        date: moment(date.value(), `DD-MM-YYYY`).toDate(),
        slug: slug.value(),
        customer: {
          name: $(`.ive-from .ive-customer-name`).value(),
          details: $(`.ive-from .ive-customer-details`).value()
        },
        payment: {
          name: $(`.ive-to .ive-payment-name`).value(),
          details: $(`.ive-to .ive-payment-details`).value()
        },
        items: $(`.ive-item-container`).map(toItemModel),
        paid: $(`.ive-paid`).value()
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
          summary: $(`.ive-item-summary`, el).value(),
          amount: parseFloat($(`.ive-item-amount`, el).value()),
          rate: parseFloat($(`.ive-item-rate`, el).value()),
        };
      }
    }

    function updatePreview () {
      const el = $.findOne(`.ive-container`);
      const model = getModel();
      model.customer.details = model.customer.details;
      model.payment.details = model.payment.details;
      const invoice = invoiceModelService.generateModel(model);
      const vm = {
        invoice: invoice,
        editing: editing
      };
      taunus.partial(el, `invoices/invoice`, vm);
    }

    function save (e) {
      e.preventDefault();
      const endpoint = form.attr(`action`);
      const invoice = getModel();
      const data = {
        json: {
          invoice: invoice
        }
      };
      viewModel.measly.post(endpoint, data).on(`data`, leave);
    }

    function leave () {
      taunus.navigate(`/invoices`);
    }
  });
};
