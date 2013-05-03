'use strict';

var config = require('../config.js'),
    async = require('async'),
    path = require('path'),
    fs = require('fs'),
    fse = require('fs-extra'),
    zombie = require('zombie');

function setup(server){
    var views = server.get('views'),
        bin = path.join(views, '/.bin'),
        indexpath = path.join(bin, 'static.idx'),
        _index;

    function visit(opts, done){
        var browser = new zombie({
            site: config.server.authority
        }), uri;

        function loaded(window) {
            var container = window.$('#content'),
                loading = container.is('.spinner-container');

            if(!loading && window.nbrut.thin.pending().length === 0){
                window.$('script').remove(); // make it _really_ static
                return true;
            }
            return false;
        }

        uri = config.server.hostSlug(opts.resource.slug) + opts.resource.url;
        browser.visit(uri, function(){
            browser.wait(loaded, function(){
                var html = config.site.doctype + browser.html();

                writeFile(opts.file, html, function(err){
                    if(err){
                        done(err);
                        return;
                    }

                    done(err, html);
                });
            });
        });
    }

    function getIndex(done){
        if (_index){
            process.nextTick(function(){
                done(null, _index);
            });
            return;
        }

        readFile(indexpath, function(err, data){
            if(err){
                done(err);
                return;
            }

            _index = data ? JSON.parse(data) : [];
            done(err, _index);
        });
    }

    function dumpIndex(done){
        console.log('Updating zombie index');
        writeFile(indexpath,  JSON.stringify(_index,null,4), done);
    }

    function find(resource, done){
        getIndex(function(err, index){
            if(err){
                done(err);
                return;
            }

            function cb(node){
                var test = node.slug === resource.slug && node.url === resource.url;
                if (test){
                    node.date = new Date(node.date);
                    done(err, node);
                }
                return test;
            }

            if(!index.some(cb)){
                done(err);
            }
        });
    }

    function findOrRefresh(resource, done){
        find(resource, function(err, result){
            if(err){
                done(err);
                return;
            }

            if(!result || (new Date() - result.date > config.zombie.cache)){
                refresh(resource, done);
            }else{
                readFile(result.file, function(err, data){
                    if(err){
                        done(err);
                        return;
                    }

                    done(err, data || '');
                });
            }
        });
    }

    function refresh(resource, done){
        getIndex(function(err, index){
            if(err){
                done(err);
                return;
            }
            var target;

            index.some(function(node){
                if(node.slug === resource.slug && node.url === resource.url){
                    target = node;
                    return true;
                }
            });

            if(target === undefined){
                var filename = resource.slug + '_' + resource.url.replace(/[\/:=\?+]/g, '_') + '.html',
                    file = path.join(bin, filename);

                target = {
                    resource: resource,
                    file: file
                };
                index.push(target);
            }

            visit(target, function(err, html){
                if(err){
                    done(err);
                    return;
                }
                target.date = new Date();
                _index = index;

                dumpIndex(function(){
                    done(err, html);
                });
            });
        });
    }

    function readFile(file, done){
        fs.exists(file, function(exists){
            if(!exists){
                done();
                return;
            }

            fs.readFile(file, function(err, data){
                if(err){
                    done(err);
                    return;
                }

                done(err, data);
            });
        });
    }

    function writeFile(file, data, done){
        fse.mkdirs(bin, function(err){
            if(err){
                throw err;
            }

            fs.writeFile(file, data, done);
        });
    }

    function shouldIgnore(req){
        var ua = req.headers['user-agent'],
            zombie = /Zombie\.js/i.test(ua),
            crawlers = [
                /Googlebot/i, // google
                /facebookexternalhit/i, // facebook
                /bingbot/i, // bing
                /slurp/i, // yahoo slurp
                /LinkedInBot/i // linkedin
            ];

        if(zombie){ // prevent recursive non-sense
            return true;
        }
        if(config.env.development && req.query['static'] !== undefined){
            return false;
        }
        return !crawlers.some(function(crawler){
            return crawler.test(ua);
        });
    }

    function proxy(req,res,next){
        if(shouldIgnore(req)){ // sanity
            return next();
        }

        findOrRefresh({ slug: req.slug, url: req.url }, function(err, html){
            if(err){
                throw err;
            }

            res.end(html);
        });
    }

    return {
        proxy: proxy
    };
}

module.exports = {
    setup: setup
};
