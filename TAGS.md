Changes by tag
==============

Brief list of changes implemented in each tagged version of **NBrut**.



0.3 (tip)
============

- Documentation
  - Improved [**README**](/README.md) with setup and installation steps to get started
  - Added an [**ENV**](/ENV.md) document with a descriptive list of environment variables

- **Blog Schema**
  - Domain fragmentation, allowing users to take control of sub-domains, referred to as slugs
  - Posts and their comments can now only be accessed in the origin slug
  - 'Dormant' mode: allows quick setup of the environment when the site is not configured
  - Personalization. Now each blog has its own set of related metadata and social links
  - OpenSearch.xml now fragmented by slug
  - RSS feed xml fragmented by slug

- Registration and Login Providers
  - Added LinkedIn

- Host validation and 301 redirects
  - In case your instance is available on multiple domains, but you want only one to expose it
    e.g: when hosting on Heroku

- Search Engine Optimization
  - [**Schema.org**](http://schema.org) microdata
  - Better meta descriptions for each individual view

- Cleaner AJAX transport (JSON over url-encoded form data when not making GET requests)

- Performance
  - Assets (such as js and css) are now served with absolute urls, for improved caching
  - Assets are now hashed with query string fingerprints and carry Expires headers

- Analytics
  - Added support for [**Clicky**](http://clicky.com/ "Clicky Web Analytics") tracking code
  - Added support for [**New Relic**](http://newrelic.com/ "New Relic Monitoring") monitoring



0.2 (frozen)
============

- Design
  - Responsive Web Design
  - Improved Markdown Editor
    - Dialogs share styles with the rest of the design
    - Image uploads (through [**imgur**](http://imgur.com/) or locally if imgur isn't set up)
	
- Search Engine Optimization
  - Sitemap.xml
  - Robots.txt
  - Headless Crawlbot
  - Open Graph microdata
  
- Validation
  - On the API
  - Client-side captures API errors and displays warnings

- Much needed comment counts on post list

- Search now hides the article bodies

- Tagging
  - Entry tagging
  - Search by tag

- Blogger Tools
  - Quick access panel to blogger features
  - Paged list of registered users, sorted by registration date
  - Paged list of discussion threads, sorted by last updated

- Login and Register redirect to the last relevant view



0.1 (frozen)
============

- Basic working version of the blog engine

- Entry writer
  - Markdown

- Comments
  - Also Markdown flavored
  
- Users
  - OAuth, OpenID and traditional logon (GitHub, Facebook, Google)
  - Gravatars
  - Profiles
  - Commenting

- [**Google Analytics**](https://www.google.com/analytics) tracking code