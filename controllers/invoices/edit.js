'use strict'

const moment = require(`moment`)
const Invoice = require(`../../models/Invoice`)
const InvoiceParty = require(`../../models/InvoiceParty`)

module.exports = function (req, res, next) {
  InvoiceParty.find({}).lean().exec(foundParties)

  function foundParties (err, allParties) {
    if (err) {
      next(err); return
    }
    const parties = allParties.reduce(partiesIntoBuckets, {
      customer: [], payment: []
    })
    const slug = req.params.slug
    if (slug) {
      Invoice.findOne({ slug: slug }).populate(`customerParty paymentParty`).lean().exec(found)
    } else {
      respond(defaultInvoice())
    }

    function partiesIntoBuckets (buckets, party) {
      if (buckets[party.type]) {
        buckets[party.type].push(party)
      } else {
        buckets[party.type] = [party]
      }
      return buckets
    }

    function found (err, invoice) {
      if (err) {
        next(err); return
      }
      if (!invoice) {
        next(`route`); return
      }
      respond(invoice)
    }

    function respond (invoice) {
      const title = slug ? `Invoice #` + slug : `New Invoice`
      const canonical = slug ? `/` + slug + `/edit` : `/new`
      res.viewModel = {
        model: {
          title: title + ` \u2014 Pony Foo`,
          meta: {
            canonical: `/invoices` + canonical
          },
          invoice: invoice,
          editing: !!slug,
          parties: parties
        }
      }
      next()
    }

    function defaultInvoice () {
      return {
        date: moment.utc().toDate(),
        customer: parties.customer[0],
        payment: parties.payment[0],
        items: []
      }
    }
  }
}
