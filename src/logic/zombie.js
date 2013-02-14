var config = require('../config.js'),
    async = require('async'),
    path = require('path'),
    fs = require('fs'),
    fse = require('fs-extra'),
    zombie = require('zombie'),
    sitemap = require('./sitemap.js');

function setup(server){
    var views = server.get('views'),
        bin = path.join(views, '/bin'),
        indexpath = path.join(bin, 'static.idx'),
        _index;

    function visit(opts, done){
        var browser = new zombie({
            site: config.server.authority
        });

        function loaded(window) {
            var container = window.$('#content'),
                loading = container.is('.spinner-container');

            return !loading && window.nbrut.thin.pending.length === 0;
        }

        browser.visit(opts.url, function(){
            browser.wait(loaded, function(){
                var html = browser.html();

                fs.writeFile(opts.file, html, function(err){
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

        fs.exists(indexpath, function(exists){
            if(!exists){
                done(null, []);
                return;
            }

            fs.readFile(indexpath, function(err, data){
                if(err){
                    done(err);
                    return;
                }

                _index = JSON.parse(data);
                done(err, _index);
            });
        })
    }

    function dumpIndex(done){
        fse.mkdirs(bin, function(err){
            if(err){
                throw err;
            }

            console.log('Updating zombie index');
            fs.writeFile(indexpath,  JSON.stringify(_index,null,4), done);
        });
    }

    function find(url, done){
        getIndex(function(err, index){
            if(err){
                done(err);
                return;
            }

            var result;

            index.forEach(function(node){
                if(node.url === url){
                    node.date = new Date(node.date);
                    result = node;
                }
            });

            done(err, result);
        });
    }

    function findOrRefresh(url, done){
        find(url, function(err, result){
            if(err){
                done(err);
                return;
            }

            if(!result || (new Date() - result.date > config.zombie.cache)){
                refresh(url, done);
            }else{
                fs.readFile(result.file, function(err, data){
                    if(err){
                        done(err);
                        return;
                    }

                    done(err, data);
                });
            }
        });
    }

    function refresh(url, done){
        getIndex(function(err, index){
            if(err){
                done(err);
                return;
            }
            var target;

            index.some(function(node){
                if(node.url === url){
                    target = node;
                    return true;
                }
            });

            if(target === undefined){
                var filename = url.replace(/[\/:=\?+]/g, '_') + '.html',
                    file = path.join(bin, filename);

                target = {
                    url: url,
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

    function serve(req,res,next){
        var googlebot = req.headers['user-agent'].indexOf('Googlebot') !== -1,
            zombiebot = req.headers['user-agent'].indexOf('Zombie.js') !== -1;

        if(!googlebot || zombiebot){ // sanity
            next();
            return;
        }

        findOrRefresh(req.url, function(err, html){
            if(err){
                throw err;
            }

            res.end(html);
        });
    }

    return {
        serve: serve
    };
}

module.exports = {
    setup: setup
};