Pony Foo [![Build Status](https://travis-ci.org/bevacqua/ponyfoo.png?branch=master)](https://travis-ci.org/bevacqua/ponyfoo) [![Dependency Status](https://gemnasium.com/bevacqua/ponyfoo.png)](https://gemnasium.com/bevacqua/ponyfoo)
========================================================================================================================

**Pony Foo** is the open-source blogging platform underlying [**Pony Foo**](http://www.ponyfoo.com "Pony Foo").

**Pony Foo** is built entirely upon _Node.JS_, _MongoDB_, and a rich client-side application layer, so it's **Javascript everywhere**.

You can read all about how I work on **Pony Foo** directly on my [blog](http://blog.ponyfoo.com/2012/12/25/pony-foo-begins "Introductory Post"), also feel free to fork this repository and fiddle with it. I'd also be delighted to hear from you, so feel free to contact me, as well.

Read [**TAGS**](/TAGS.md) for a complete list of release changes.

Read [**TODO**](/TODO.md) for a roadmap of upcoming changes.



Setup and Installation
======================

To get up and running locally you will need to have installed [**Node.js**](http://nodejs.org/) and [**MongoDB**](http://www.mongodb.org/).

- Configure MongoDB and then create a local database called `ponyfoo`. [You might **want to read this**](http://docs.mongodb.org/manual/tutorial/getting-started/ "Getting Started with MongoDB Development")
- Configure `www.local-ponyfoo.com` as an alias of `127.0.0.1`. On windows it's very easy to do so, adding a line to this file: `%WINDIR%\System32\drivers\etc\hosts`

After following those steps, the application should be accessible at `www.local-ponyfoo.com`. Now you can follow the installation instructions on the setup guide, available once you access the website.

An extensive list of [**Environment Variables**](/ENV.md) is available for you to look at, _but you don't need to set any of that to get up and running_.