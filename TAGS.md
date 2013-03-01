Changes by tag
==============

Brief list of changes implemented in each tagged version of **NBrut**.



0.3 (tip)
============

- **Blog Schema**

- Registration and Login Providers
  - Added LinkedIn

- Host validation and 301 redirects
  - In case your site is available on multiple domains, but you want only one to expose it
    e.g: when hosting on Heroku

- Search Engine Optimization
  - [**Schema.org**](http://schema.org) microdata


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