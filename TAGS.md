# Changes by Tag


Brief list of changes implemented in each tagged version of **Pony Foo**



# 0.4 (sturdy-lad) wip

**Email notifications**, _at last!_ Marketing Site. Documentation Site.

- Marketing Site
  - Email Subscription
  - Flat UI Design
  - Video Presentation
  
- Ultramarked everywhere

- Documentation Site
  - DISQUS comments
  - Flat UI Design
  - Markdown documentation

- Blogging Standards
  - Added PingBack functionality
    - Basic support

- Emailing and email templates
  - Transactional email using [Mandrill](https://mandrillapp.com "Mandrill by MailChimp")
  - Blog post email subscriptions
  - Blog comment email notifications

- Social Discovery
  - Tweet Button
  - Tweet Embeds
  - Pocket Button

- Enhanced login process
  - Accounts created with ancient flow require email verification
  - Password reset implementation

- Development Productivity
  - Introduced [dictatorship](https://github.com/bevacqua/dictatorship "dictatorship on GitHub") to bury **EADDRINUSE** issues during continuous development



# 0.3 (mutant)

**Sharding**, now a _true blogging engine_. Better _documentation_.

- Documentation
  - Improved [**README**](/README.md) with setup and installation steps to get started
  - Added an [**ENV**](/ENV.md) document with a descriptive list of environment variables

- **Blog Schema**
  - Market, allowing users to take control of sub-domains, referred to as slugs
    - The market can be enabled or disabled through configuration
    - In a later iteration, it will be possible to create new blogs within the market
  - Posts and their comments can now only be accessed in the owner slug
  - 'Dormant' mode: allows quick setup of the environment when the site is not configured
  - Personalization. Now each blog has its own set of related metadata and social links

- Providers
  - Added LinkedIn login and registration
  - Added Twitter as a service to publish tweets on new posts

- Host validation and 301 redirects
  - In case your instance is available on multiple domains, but you want only one to expose it
    e.g: when hosting on Heroku

- Search Engine Optimization
  - [**Schema.org**](http://schema.org) microdata
  - Better meta descriptions for each individual view
  - `/opensearch.xml` now fragmented by slug
  - `/rss/latest.xml` (RSS feed) fragmented by slug
  - `/sitemap.xml` fragmented by slug
  - sitemaps are now aggregated in `/sitemap_index.xml`

- Cleaner Architecture
  - AJAX transport (JSON over url-encoded form data when not making GET requests)
  - Hosts are now more cleanly separated
  - The architecture now follows a slightly more traditional approach
  - Added RECESS to lint CSS code

- Performance
  - Assets (such as js and css) are now served with absolute urls, for improved caching
  - Assets are now hashed with query string fingerprints and carry Expires headers

- Analytics
  - Added support for [**Clicky**](http://clicky.com/ "Clicky Web Analytics") tracking code

- Usability and design
  - Re-branded as Pony Foo
  - Got rid of redundant 'Register' button
  - About box is no longer hidden behind a button, but directly accessible on blog home pages
  - An estimate of the time to read a post was added, and it's updated as you read a post



# 0.2 (baby-steps)

**User-friendlier** design, _metadata and SEO_ treated with more respect.

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



# 0.1 (toddler)

Basic, _working_, blogging engine.

- Entry writer
  - Markdown

- Comments
  - Also Markdown flavored
  
- Users
  - OAuth, OpenID and traditional logon (GitHub, Facebook, Google, plain)
  - Gravatars
  - Profiles
  - Commenting

- [**Google Analytics**](https://www.google.com/analytics) tracking code
