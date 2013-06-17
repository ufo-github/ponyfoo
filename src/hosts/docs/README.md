# Blog Marketplace #

This vhost is in charge of the platform's documentation. The minisite is entirely generated.

In the first step, `grunt ngdoc` will generate the HTML documentation partials and some metadata such as the sitemap, and place it in `./generated`.

A second step, `grunt assetify:docs` will build the custom static assets used to style the site.