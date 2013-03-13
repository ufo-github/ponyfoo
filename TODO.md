TODO
=======

1
-------

- sitemaps
  - http://www.devcha.com/2010/07/how-to-submit-xml-sitemaps-for-multiple.html
  - sitemap_index.xml references sitemaps for all blogs


- migration steps:
 - db.users.update( { blogger: { $exists: true } }, {$unset: { blogger : 1 } }, false, true)
 - remove query for user when awakening
 - config blog to have stuff from config.site and config.blogger
 - db.entries.update({}, { $set: { blog: { ObjectId("OBJECT_ID_OF_YOUR_BLOG") } }, false, true)

 - use these values in production's main blog
    site: {
        title: 'Pony Foo',
        description: 'Ramblings of a degenerate coder'
    },
    blogger: {
        about: "I'm Nicolas Bevacqua. I live in Buenos Aires, Argentina. This is my technical blog."*/
    }

- blog claiming in available subdomains (existing bloggers can't claim zilch)
  - start migration with domain restricted to just www, so blogs can't be claimed at all, but I can update prod.



2
-------

- introduce library such as underscore on the server-side

- post about css for dummies
- post regarding css flips (And temporary highlighting, usage of localStorage, maybe separately)



3
-------

- marked over pagedown
- client-side caching?
- proper api authentication?
- reduce fat in client-side template registration