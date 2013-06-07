'use strict';

var config = require('../../config'),
    path = require('path');

var frontend = path.join(process.cwd(), '/src/frontend');

module.exports = {
    prepare: function(base){
        var source = config.statics.folder(base),
            relative = path.relative(source, frontend),
            pub = path.join(frontend, '/public');

        return {
            production: config.env.production,
            assets:  {
                favicon: config.statics.faviconSource,
                source: source,
                bin: config.statics.bin(base),
                roots: [pub]
            },
            plugins: {
                jsn: true,
                forward: [{ extnames: ['.txt'] }, true]
            },
            caching: {
                expiresHeader: function(req){
                    return req.url.indexOf('/img/') === 0;
                }
            },
            resolveFrontendPath: function(file){
                return path.join(relative, file);
            }
        };
    },
    complete: function(data){
        var resolve = data.resolveFrontendPath,
            assets = data.assets;

        assets.js = assets.js || [];

        if(!!config.tracking.analytics){
            assets.js.push({
                file: resolve('/js/ext/analytics.jsn'),
                context: { config: config }
            });
        }

        if(!!config.tracking.clicky){
            assets.js.push({
                file: resolve('/js/ext/clicky.jsn'),
                context: { config: config }
            });
        }

        return data;
    }
};
