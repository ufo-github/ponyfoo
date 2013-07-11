# TODO 

## 1

- fix nightmares with session, domains, and passports

- market
  - prettier header
  - video
  - subscription implementation

- docs
  - markdown playground.
  - docs about our editor, shortcuts, etc?

- bugs and features
  - email brief relative links should be absolutized
  - rss feed should have better excerpts
  - comment review ordering
  - pingback issue: Error: Can't set headers after they are sent. 
    at ServerResponse.OutgoingMessage.setHeader (http.js:704:11)
    at ServerResponse.res.setHeader (/app/node_modules/connect/lib/patch.js:59:22) 
    at null._fault (/app/node_modules/pingback/lib/pingback.js:97:14) 
    at /app/node_modules/pingback/lib/pingback.js:274:19
    at end (/app/node_modules/pingback/lib/pingback.js:467:7) 
    at IncomingMessage.<anonymous> (/app/node_modules/pingback/lib/pingback.js:475:9)
    at IncomingMessage.EventEmitter.emit (events.js:95:17) 
    at IncomingMessage.<anonymous> (_stream_readable.js:736:14) at IncomingMessage.EventEmitter.emit (events.js:92:17) 
    at emitReadable_ (_stream_readable.js:408:10) at emitReadable (_stream_readable.js:404:5) 
    at readableAddChunk (_stream_readable.js:165:9) at IncomingMessage.Readable.push (_stream_readable.js:127:10) 
    at HTTPParser.parserOnBody [as onBody] (http.js:140:22) 
    at Socket.socketOnData [as ondata] (http.js:1535:20) 
    at TCP.onread (net.js:510:27) EXCEPT Context

- cluster

- related articles @ `blogEntryService.js#getRelated`

## 2

- re-do REST api. add oauth

- blog
  + ui/ux
    - configure which buttons to use per blog
    - buffer button option
    - pdf
    - data-related author's twitter, take from req.blogger
    - font consistency in blog (mac)

  + editor    
    - autosave drafts to localStorage periodically (5s~)
    - allow perm. storing drafts in backend
    - zen/md mixed editor

  + comments
    - redesign commenting frontend (which blows)
    - anon commenting option.

  - list users only for back-end people, not any blogger
  - adaptable design ?

- server
  - basic auth
  - clustered domains
  - port watch
  - persistent logging

- pingbacks
  - Display PingBacks on each blog entry
  - Can be disabled on a per-entry basis

- refactor:
    - drop crudService
    - refactor authenticationController, feedController
    - refactor api controllers, move logic to services, rename exports more semantically
    - css lint (and different classing philosophy)



## 3

- client-side caching?

- partition the build process so that continuous development
  doesn't re-do everything for every single file
  