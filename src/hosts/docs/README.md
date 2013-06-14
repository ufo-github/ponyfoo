# Blog Marketplace #

This vhost is in charge of the platform's documentation. The minisite is entirely generated.

In the first step, `grunt ngdocs` will generate the HTML documentation partials and the general structure for the app, and place it in `./public`.

A second step, `grunt assetify:docs` will build the custom static assets used to style the site.