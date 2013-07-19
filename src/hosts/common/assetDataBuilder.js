'use strict';

var config = require('../../config'),
    path = require('path'),
    cwd = process.cwd(),
    frontend = path.join(cwd, '/src/frontend');

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
                forward: [{ extnames: ['.eot', '.svg', '.ttf', '.woff'] }, true]
            },
            expires: /^img/i,
            resolveFrontendPath: function(file){
                return path.join(relative, file);
            }
        };
    },
    complete: function(data){
        var resolve = data.resolveFrontendPath,
            assets = data.assets;

        assets.js = assets.js || [];
        assets.js.push(resolve('/js/analytics/nbrut.js')); // so other code might use it.

        if(!!config.tracking.analytics){
            assets.js.push({
                file: resolve('/js/analytics/google.jsn'),
                context: { tracking: config.tracking }
            });
        }

        if(!!config.tracking.clicky){
            assets.js.push({
                file: resolve('/js/analytics/clicky.jsn'),
                context: { tracking: config.tracking }
            });
        }

        return data;
    }
};
