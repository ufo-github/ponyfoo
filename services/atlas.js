'use strict'

const contra = require(`contra`)
const glob = require(`glob`)
const chokidar = require(`chokidar`)
const cheerio = require(`cheerio`)
const winston = require(`winston`)
const beautifyText = require(`beautify-text`)
const path = require(`path`)
const fs = require(`fs`)
const env = require(`../lib/env`)
const htmlService = require(`../services/html`)
const semojiService = require(`../services/semoji`)
const nodeEnv = env(`NODE_ENV`)
const dev = nodeEnv === `development`
const bookCache = new Map()
const bookSlugs = new Set()
const dataDir = `./dat/oreilly-books`
let htmlBookWatcher = null

function createHtmlBookWatcher () {
  const htmlBookWatcher = chokidar.watch([])

  htmlBookWatcher
    .on(`error`, err => winston.warn(`Error watching ${dataDir}!`, err))
    .on(`all`, (event, filepath) => {
      const [,, bookSlug] = filepath.split(path.sep)
      invalidateCache(bookSlug)
    })

  return htmlBookWatcher
}

function watchBookHtml (bookSlug) {
  if (!htmlBookWatcher) {
    htmlBookWatcher = createHtmlBookWatcher()
  }
  htmlBookWatcher.add(`${dataDir}/${bookSlug}/html`)
}

function invalidateCache (bookSlug) {
  bookCache.delete(bookSlug)
}

function getCache (bookSlug) {
  if (!bookCache.has(bookSlug)) {
    bookCache.set(bookSlug, {
      sectionCache: new Map(),
      chapterTitleCache: new Map()
    })
    if (!bookSlugs.has(bookSlug)) {
      bookSlugs.add(bookSlug)
      watchBookHtml(bookSlug)
    }
  }
  return bookCache.get(bookSlug)
}

function getFilename ({ bookSlug, sectionId }) {
  return `${dataDir}/${bookSlug}/html/${sectionId}.html`
}

function read ({ bookSlug, sectionId, isChapter, isToc }, done) {
  const { sectionCache } = getCache(bookSlug)
  const filename = getFilename({ bookSlug, sectionId })
  if (!dev && sectionCache.has(sectionId)) {
    done(null, sectionCache.get(sectionId)); return
  }
  if (!isChapter) {
    readFromDisk(filename); return
  }

  findChapters({ bookSlug, chapterId: sectionId }, (err, chapters) => {
    if (err) {
      done(err); return
    }
    if (!chapters.length) {
      done(null, null); return
    }
    const [chapter] = chapters
    readFromDisk(chapter)
  })

  function readFromDisk (file) {
    fs.readFile(file, `utf8`, pullBody); return
  }

  function pullBody (err, html) {
    if (err || !html) {
      winston.warn(`Atlas section "${bookSlug}/${sectionId}" not found.`)
      done(null, null)
      return
    }
    const emojified = semojiService.compile(html)
    const $ = cheerio.load(emojified)
    fixChapterLinks($, bookSlug, isToc)
    fixImageLinks($, bookSlug)
    fixAsides($)
    fixFootnotes($)
    fixCodeBlocks($)
    fixText($)
    const body = $(`body`).html().trim()
    const deferred = htmlService.deferImages(body)
    const minified = htmlService.minify(deferred)
    sectionCache.set(sectionId, minified)
    done(null, sectionCache.get(sectionId))
  }
}

function getTableOfContents (bookSlug, done) {
  read({ bookSlug, sectionId: `toc`, isToc: true }, done)
}

function getChapterHtml ({ bookSlug, chapterId }, done) {
  read({ bookSlug, sectionId: chapterId, isChapter: true }, done)
}

function getChapterTitle ({ bookSlug, chapterId }, done) {
  const { chapterTitleCache } = getCache(bookSlug)
  if (!dev && chapterTitleCache.has(chapterId)) {
    success(); return
  }

  getChapterHtml({ bookSlug, chapterId }, (err, html) => {
    if (err) {
      done(err); return
    }
    if (html === null) {
      done(null, null); return
    }
    const title = cheerio
      .load(html)(`h1`)
      .eq(0)
      .text()

    chapterTitleCache.set(chapterId, title)
    success()
  })

  function success () {
    done(null, chapterTitleCache.get(chapterId))
  }
}

function getChapter ({ bookSlug, chapterId }, done) {
  contra.concurrent({
    html: next => getChapterHtml({ bookSlug, chapterId }, next),
    title: next => getChapterTitle({ bookSlug, chapterId }, next)
  }, got)
  function got (err, result) {
    if (err) {
      done(err); return
    }
    if (result.html === null) {
      done(null, null); return
    }
    const $ = cheerio.load(result.html)
    $(`[data-type='sect1']`).slice(1).remove()
    $(`[data-type='sect2']`).slice(2).remove()
    result.teaserHtml = $.html()
    done(null, result)
  }
}

function getChapterLinks ({ bookSlug, chapterId }, done) {
  const section = parseInt(chapterId, 10)

  contra.concurrent({
    prev: next => getChapterLink(bookSlug, section - 1, next),
    next: next => getChapterLink(bookSlug, section + 1, next)
  }, done)
}

function getChapterLink (bookSlug, chapterId, done) {
  findChapters({ bookSlug, chapterId }, found)

  function found (err, files) {
    if (err) {
      done(err); return
    }
    if (files.length === 0) {
      done(null, null); return
    }
    getChapterTitle({ bookSlug, chapterId }, (err, title = `Chapter ${chapterId}`) => {
      if (err) {
        winston.warn(`Error fetching a book chapter title`, err)
      }
      done(null, {
        href: `/books/${bookSlug}/chapters/${chapterId}`,
        title
      })
    })
  }
}

function getChapterId (file) {
  const rdigits = /ch(\d+)\.html/
  const [, numbers] = file.match(rdigits)
  const chapterId = parseInt(numbers, 10)
  return chapterId
}

function findAllChapters ({ bookSlug }, done) {
  glob(`${dataDir}/${bookSlug}/html/ch*.html`, done)
}

function findChapters ({ bookSlug, chapterId }, done) {
  findAllChapters({ bookSlug }, (err, files) => {
    if (err) {
      done(err); return
    }
    done(null, files.filter(file => getChapterId(file) === chapterId))
  })
}

function getFirstChapterLink (bookSlug, done) {
  findAllChapters({ bookSlug }, (err, files) => {
    if (err) {
      done(err); return
    }
    if (files.length === 0) {
      done(null, null); return
    }
    const file = files[0]
    const chapterId = getChapterId(file)
    getChapterLink(bookSlug, chapterId, done)
  })
}

function fixChapterLinks ($, bookSlug, isToc) {
  const rchapter = /^ch(\d+)\.html/i

  if (isToc) {
    fixTableOfContents()
  }
  $(`a[href]`, `body`).each((i, el) => fixChapterLink(el))

  function getChapterId (text) {
    if (!rchapter.test(text)) {
      return null
    }
    const [, chapterId] = text.match(rchapter)
    return parseInt(chapterId, 10)
  }

  function fixTableOfContents () {
    $(`ol`, `body`)
      .eq(0)
      .addClass(`otoc-main`)
      .find(`ol`)
      .addClass(`otoc-list`)

    $(`.otoc-main > li`).each((i, el) => fixTableItem(el))
  }

  function fixTableItem (el) {
    const $el = $(el).find(`a`).eq(0)
    const href = $el.attr(`href`)
    const chapterId = getChapterId(href)
    if (!chapterId) {
      return
    }
    $el.text(`${ chapterId } ${ $el.text() }`)
  }

  function fixChapterLink (el) {
    const $el = $(el)
    const href = $el.attr(`href`)
    if (!getChapterId(href)) {
      return
    }
    if (isToc) {
      $el.addClass(`lk-link lk-black`)
    }
    const update = (all, chapterId) => updateHref(href, chapterId)
    $el.attr(`href`, href.replace(rchapter, update))
  }

  function updateHref (href, chapterId) {
    const id = parseInt(chapterId, 10)
    const chapter = `/books/${bookSlug}/chapters/${id}`
    const rhtml = /\.html$/i
    if (rhtml.test(href) && isToc) {
      return chapter + `#read`
    }
    return chapter
  }
}

function fixImageLinks ($, bookSlug) {
  $(`img[src]`, `body`).each((i, el) => {
    const $el = $(el)
    const src = $el.attr(`src`)
    const rimage = /^images\//i
    if (!rimage.test(src)) {
      return
    }
    $el.attr(`src`, src.replace(rimage, `/books/${bookSlug}/img/`))
  })
}

function fixAsides ($) {
  $(`[data-type='sidebar']`).each((i, el) => {
    const even = (i + 1) % 2 === 0
    const evenClass = even ? `even` : `odd`
    $(el).addClass(`ocha-s-sidebar-${ evenClass }`)

    // sidebars use <h5> instead of <h1>, don't have a title. we normalize
    fixSectionHeader($, el, `Sidebar`)
  })

  $(`[data-type='sidebar'], [data-type='warning']`).each((i, el) => {
    const $el = $(el)
    const type = $el.data(`type`)
    $el
      .addClass(`ocha-s ocha-s-${type}`)
      .find(`> h6:first-child`)
      .addClass(`ocha-s-title ocha-s-${type}-title`)
  })
}

function fixSectionHeader ($, el, text) {
  const $el = $(el)

  const legacyHeading = $el.find(`> h5:first-child`)
  const heading = $(`<h1>`).append(legacyHeading.contents())
  legacyHeading.replaceWith(heading)

  const id = $el.attr(`id`)
  const title = $(`<h6>`)
  const anchor = $(`<a>`)
    .attr(`href`, `#${id}`)
    .addClass(`md-heading`)
    .text(text)
  title.append(anchor)
  $el.prepend(title)
}

function fixFootnotes ($) {
  $(`[data-type='noteref']`).addClass(`ocha-footnote-ref`)
  $(`[data-type='footnotes']`)
    .addClass(`ocha-footnotes`)
    .find(`[data-type='footnote']`)
    .each((i, el) => {
      const $el = $(el)
      const $sup = $el.find(`sup`)
      const id = $el.attr(`id`)
      const anchor = $sup.find(`a`).addClass(`ocha-footnote-anchor`)
      const content = $(`<div>`).addClass(`ocha-footnote-content`)
      const footnote = $(`<div>`).addClass(`ocha-footnote`).attr(`id`, id)
      footnote.append(anchor)
      $sup.remove()
      content.append($el.contents())
      footnote.append(anchor)
      footnote.append(content)
      $el.parent().append(footnote)
      $el.remove()
    })
}

function fixText ($) {
  const rbeautiable = /\S/
  $(`body`)
    .find(`:not(iframe,pre,code,:empty)`)
    .contents()
    .filter((i, el) => el.nodeType === 3 && rbeautiable.test(el.nodeValue))
    .each((i, el) => {
      el.nodeValue = beautifyText(el.nodeValue)
    })
}

function fixCodeBlocks ($) {
  $(`[data-highlighted]`).addClass(`ocha-highlighted`)
  $(`[data-type="programlisting"]`).addClass(`ocha-code-block md-code-block`)
  $(`code`).not(`pre code`).addClass(`md-code md-code-inline`)
}

module.exports = {
  getTableOfContents,
  getFirstChapterLink,
  getChapter,
  getChapterLinks
}
