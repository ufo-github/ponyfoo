TODO
=======

1
-------

- **domain fragmentation**
  - available blog market

- absolute path in js/css/image for better caching (e.g //www.)

- profiles expansion
  - use blog info in about flip-card (set up a "blog" local context for each request)

- migration:
 - db.users.update( { blogger: { $exists: true } }, {$unset: { blogger : 1 } }, false, true)
 - remove query for user when awakening



2
-------

- post about css for dummies
- post regarding css flips (And temporary highlighting, usage of localStorage, maybe separately)



3
-------

- client-side caching?
- proper api authentication?
- reduce fat in client-side template registration