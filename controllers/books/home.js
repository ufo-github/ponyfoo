'use strict'

const env = require(`../../lib/env`)
const staticService = require(`../../services/static`)
const oreillyService = require(`../../services/oreilly`)
const authority = env(`AUTHORITY`)

module.exports = function (req, res, next) {
  oreillyService.getAllMetadata((err, oreilly) => {
    if (err) {
      next(err); return
    }
    res.viewModel = {
      model: {
        title: `Books written by Nicolás Bevacqua \u2014 Pony Foo`,
        meta: {
          canonical: `/books`,
          images: [
            ...oreilly.map(book => authority + book.coverHref),
            authority + staticService.unroll(`/img/javascript-application-design.jpg`),
            authority + staticService.unroll(`/img/banners/branded.png`)
          ],
          description: `After I started blogging early in 2013. I became increasingly interested in writing a book, and that interest led me to start writing a book. My first book, JavaScript Application Design, materialized. These days I'm working on the Modular JavaScript book series, starting with Practical ES6.`
        },
        oreilly: oreilly.map(book => ({
          slug: book.slug,
          coverHref: book.coverHref,
          oneline: book.oneline,
          publicationYear: book.publicationYear
        }))
      }
    }
    next()
  })
}
