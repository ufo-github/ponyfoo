Environment Variables
=====================

Environment configuration is taken from `.env.defaults`, then `.env`, and lastly, `process.env`.

If you are hosting your site using [**Heroku**](https://heroku.com "Heroku"), you might want to use [**Foreman**](https://devcenter.heroku.com/articles/config-vars#local-setup "Local Setup for Heroku sites") to configure these locally.

A good alternative is the JetBrains IDE for Node.JS, [**WebStorm**](http://www.jetbrains.com/webstorm/ "WebStorm"). 

Note that most of these have default values, which might come either from Node.js or from the configuration file for **Pony Foo**.

Required
--------

These are the environment variables that are an _absolute must_ for **Pony Foo** to run.

- No environment variables are required to installing **Pony Foo**.



General
-------

These are general purpose variables which are always useful to configure.

- **LOG_LEVEL**: One of the following values: `['DEBUG','INFO','WARN','ERROR','FATAL']`. Determines the verbosity of the logging output.
- **PLATFORM_NAME**: The name of the platform, used throught the application to refer to the entire platform.



Hosting
-------

These variables are usually very important for **deployments**, but the default values are _Ok_ in the development environment.

- **NODE_ENV**: Node.js environment, defaults to `'development'`, options include `'staging'` and `'production'`. By default, production environments minify and bundle assets, compress responses, while the development environment uses unminified sources and provides a few more features for debugging.
- **HOST_TLD**: The `TLD` for the site, this is important when slugging, because every blog is hosted on a subdomain. Defaults to `'local-ponyfoo.com'`.
- **ENABLE_SLUGGING**: Enables blog slugging. When disabled, users can't create their own blogs on the platform. Defaults to `false`.

- **ENABLE_MARKET**: Whether the market vhost is enabled. Defaults to `false`.
- **HOST_MARKET**: The default `slug` for the site, that is, the **semantic root** of the site. Defaults to `'www'`.

- **HOST_DOCS**: The subdomain used to host the platform documentation.

- **HOST_REGEX**: An optional regex to restrict the host. Useful when your site is accessible through multiple `TLD`s but you only want one to serve responses. When a request doesn't match this regex, it gets permanently redirected to the same url on the default TLD.
- **PORT**: The actual port where the application will listen on. Defaults to port `8081`.
- **PUBLIC_PORT**: The public facing port. Sometimes, production environments use architectures set up with load balancers and assign ports arbitrarily to your application, but the domain will still use port `80`, this helps avoid issues when redirecting requests. Defaults to `PORT`.

- **MONGO_URI** (or **MONGOLAB_URI**): The connection uri to your MongoDB server. Defaults to `'mongodb://localhost/ponyfoo'`.

- **BLOG_DEFAULT**: The default blog slug. Defaults to `'blog'`. i.e: http://blog.local-ponyfoo.com`
- **BLOG_REGEX**: An optional regex to restrict the subdomains that are available to users. Implicitly adds `'^'` and `'$'` to the regex. Requests that fail a test against this regex get permanently redirected to the default slug. By default it's unrestricted.
- **ENABLE_BLOG_REGEX_301**: If `'true'`, permanently redirects requests to filtered blog slugs to the market home.



API Credentials
---------------

There isn't a lot to say about API credentials. These are required in order to work with various APIs.

- **FACEBOOK_APP_ID**: Your [**Facebook**](https://developers.facebook.com/apps) application ID. Used by the authentication provider.
- **FACEBOOK_APP_SECRET**: Your [**Facebook**](https://developers.facebook.com/apps) application secret. Used by the authentication provider.

- **GITHUB_CLIENT_ID**: Your [**GitHub**](https://github.com/settings/applications) client ID. Used by the authentication provider.
- **GITHUB_CLIENT_SECRET**: Your [**GitHub**](https://github.com/settings/applications) client secret. Used by the authentication provider.

- **LINKEDIN_API_KEY**: Your [**LinkedIn**](https://www.linkedin.com/secure/developer) API key. Used by the authentication provider.
- **LINKEDIN_API_SECRET**: Your [**LinkedIn**](https://www.linkedin.com/secure/developer) API secret. Used by the authentication provider.

- **IMGUR_API_KEY**: Your [**imgur**](https://imgur.com/register/api_anon) API key. Used by **file uploads**, if `undefined`, images will be uploaded to `/img/uploads`.

Twitter API isn't supported for authentication, because they don't provide emails. Twitter is used for broadcasting links to new posts.

- **ENABLE_TWITTER_BROADCAST**: Whether to enable [**Twitter**](https://dev.twitter.com) broadcasts.
- **TWITTER_CONSUMER_KEY**: Your [**Twitter**](https://dev.twitter.com) application consumer key.
- **TWITTER_CONSUMER_SECRET**: Your [**Twitter**](https://dev.twitter.com) application consumer secret.
- **TWITTER_ACCESS_TOKEN_KEY**: Your [**Twitter**](https://dev.twitter.com) application access token key.
- **TWITTER_ACCESS_TOKEN_SECRET**: Your [**Twitter**](https://dev.twitter.com) application access token secret.

- **MANDRILL_APIKEY**: API key used to send email through the [**Mandrill**](https://mandrillapp.com "Mandrill App") service provided by [MailChimp](http://mailchimp.com/ "MailChimp").
- **MANDRILL_DEBUG_ENABLED**: Whether we are debugging **Mandrill** messages.
- **MANDRILL_DEBUG_TRAP**: An email address that will receive every email, ignoring the actual recipient.
- **MANDRILL_SENDER_ADDRESS**: The email from address to use

- **DISQUS_SHORTNAME_DOCS**: The shortname identifier for DISQUS used in the documentation minisite.


Miscellaneous
-------------

You shouldn't need to touch these, but you can, of course.

- **ENABLE_ZOMBIE_CRAWLER**: Whether or not to configure a headless browser to yield something other than a bunch of templates when a crawler hits the site. By default, this is set to `true`.

- **SALT_WORK_FACTOR**: Your choice of a salt work factor for [**bcrypt**](https://github.com/ncb000gt/node.bcrypt.js) encryption, shouldn't need to edit.

- **SESSION_SECRET**: Your session storage secret key.

- **ENABLE_VERSION_DISPLAY**: Whether to display the current version number on a few, discrete places.

- **TOKEN_EXPIRATION**: Time, expressed in seconds, after which tokens such as password reset or email validation expire.



Analytics
---------

These enable different analytics tools on your site.

- **GA_CODE**: Set to your [**Google Analytics**](https://www.google.com/analytics) code. Outputs GA tracking code.

- **CLICKY_SITE_ID**: [**Clicky**](http://clicky.com/ "Clicky Web Analytics") service integration, set to the site ID they grant you.



Contact
---------

These are used in the market (**semantic root**) to display contact information

- **CONTACT_EMAIL**: Contact email address.
- **CONTACT_TWITTER**: Twitter username. No 'at' symbol.

- **GITTIP_USER**: Gittip username.