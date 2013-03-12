TODO
=======

1
-------

- blog claiming in available subdomains (existing bloggers can't claim zilch)

- comment restriction

- RSS
  - one feed per blog.
  - drop direct feedburner support, except in main blog (via env var)

- sitemaps
  - http://www.devcha.com/2010/07/how-to-submit-xml-sitemaps-for-multiple.html
  - sitemap_index.xml references sitemaps for all blogs
  - sitemap.xml returns sitemap for specific blog or 404 if no blog



- migration steps:
 - db.users.update( { blogger: { $exists: true } }, {$unset: { blogger : 1 } }, false, true)
 - remove query for user when awakening
 - config blog to have stuff from config.site and config.blogger
 - db.entries.update({}, { $set: { blog: { ObjectId("OBJECT_ID_OF_YOUR_BLOG") } }, false, true)



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