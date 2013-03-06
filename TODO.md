TODO
=======

1
-------

- blog claiming in available subdomains (existing bloggers can't claim zilch)
- blog entry attached to blog, filters

- revisit RSS feed stuff, multiple feeds, ? how to deal with that.
  - same with sitemap(s)
  - same with opensearch

- migration steps:
 - db.users.update( { blogger: { $exists: true } }, {$unset: { blogger : 1 } }, false, true)
 - remove query for user when awakening
 - config blog to have stuff from config.site and config.blogger



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