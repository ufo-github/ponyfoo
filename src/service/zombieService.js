'use strict';

var config = require('../config'),
    async = require('async'),
    path = require('path'),
    fs = require('fs'),
    fse = require('fs-extra'),
    zombie = require('zombie');

function setup(server, userAgents, loaded){
    var views = server.get('views'),
        bin = path.join(views, '/.bin'),
        indexpath = path.join(bin, 'static.idx'),
        _index;

    function visit(opts, done){
        var browser = new zombie({
            site: config.server.authority(opts.resource.slug)
        }), uri;

        uri = config.server.authority(opts.resource.slug) + opts.resource.url;
        browser.visit(uri, function(){
            var complete = false;
            async.until(test, function () {

                browser.wait(loaded, function(testagain){
                    console.log('\nIndexing Result..');
                    console.log(browser.statusCode);
                    console.log(browser.success);
                    console.log(JSON.stringify(browser.errors||[],null,2));
                    var didload = !!browser.query('main');
                    if (!didload) {
                        testagain(); return;
                    }
                    var html = config.site.doctype + browser.html();
                    writeFile(opts.file, html, function(err){
                        complete = true;
                        if(err){
                            done(err);
                            testagain();
                            return;
                        }
                        done(err, html);
                        testagain();
                    });
                });
            }, function (err) {
                if (!complete) { done(err); console.log('Indexing failed.', err); }
            });
            function test(){return complete;}
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
                return done(err);
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
                return done(err);
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
                return done(err);
            }

            if(!result || (new Date() - result.date > config.zombie.cache)){
                refresh(resource, done);
            }else{
                readFile(result.file, function(err, data){
                    if(err){
                        return done(err);
                    }

                    done(err, data || '');
                });
            }
        });
    }

    function refresh(resource, done){
        getIndex(function(err, index){
            if(err){
                return done(err);
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
                    return done(err);
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
                return done();
            }

            fs.readFile(file, function(err, data){
                if(err){
                    return done(err);
                }

                done(err, data);
            });
        });
    }

    function writeFile(file, data, done){
        fse.mkdirs(bin, function(err){
            if(err){
                return done(err);
            }

            fs.writeFile(file, data, done);
        });
    }

    function shouldIgnore(req){
        var ua = req.headers['user-agent'],
            zombie = /Zombie\.js/i.test(ua);

        if(!config.zombie.enabled){
            return true;
        }
        if(zombie){ // prevent recursive non-sense
            return true;
        }
        if(config.env.development && req.query['static'] !== undefined){
            return false;
        }
        return !userAgents.some(function(crawler){
            return crawler.test(ua);
        });
    }

    function proxy(req,res,next){
        if(shouldIgnore(req)){ // sanity
            return next();
        }

        findOrRefresh({ slug: req.slug, url: req.url }, function(err, html){
            if(err){
                next(err);
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
