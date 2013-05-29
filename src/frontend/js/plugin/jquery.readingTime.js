!function ($, window, document, undefined) {
    'use strict';

    var $window = $(window),
        $document = $(document),
        all = [],
        lastId = 0,
        lastScrollTop = 0,
        sliceTimer, slice,
        rtrimspaces = /\s+/g;

    function Plugin(element) {
        this.$element = $(element);
        this.init();
    }

    Plugin.prototype = {
        init: function (){
            var plugin = this,
                bubble = $('<div/>').addClass('reading-time');

            if(plugin.$element.length !== 1){
                throw new Error('jquery.readingTime must run on a single element at a time.');
            }
            plugin.$bubble = bubble;
            
            bubble.appendTo(plugin.$element);
            bubble.on('mouseenter', function(){
                if(plugin.fade_timer){
                    clearTimeout(plugin.fade_timer);
                }
                bubble.stop().animate({opacity: 1});
            });
            bubble.on('mouseleave', function(){
                bubble.stop().animate({opacity: 0.4});
            });
        },
        isReadable: function(){
            return this.$element.is(function(){
                var height = window.innerHeight / 2,
                    rect = this.getBoundingClientRect(),
                    readable = (
                        rect.bottom > height &&
                        rect.top < height
                    );

                return readable;
            });
        }
    };

    function update(plugin){
        var bubble = plugin.$bubble,
            measurements = measure(plugin.$element, bubble),
            text = getBubbleText(measurements),
            readable = plugin.isReadable();

        if(readable){
            if($window.width() >= 768){
                bubble.css('top', measurements.distance).text(text).fadeIn(100);
            }

            // fade out the annotation after a second of no scrolling through.
            if(plugin.fade_timer){
                clearTimeout(plugin.fade_timer);
            }

            plugin.fade_timer = setTimeout(function(){
                bubble.fadeOut();
            }, 1500);
        }
    }

    function getBubbleText(measurements){
        if(measurements.remaining > 1){
            return measurements.remaining + ' minutes left';
        }else if(measurements.progress >= 1) {
            return 'Thanks for reading!';
        }else if(measurements.remaining <= 1){
            return 'Less than a minute';
        }
    }

    function calculateTotalMinutes(element){
        var text = element.text(),
            stripped = text.replace(rtrimspaces, ' '),
            words = stripped.split(' ').length,
            wordsPerMinute = 200,
            minutes = Math.round(words / wordsPerMinute);

        return minutes;
    }

    function getTotalMinutes($element){
        var key = 'readingTime-minutes',
            minutes = $element.data(key);

        if(!minutes){
            minutes = calculateTotalMinutes($element);
            $element.data(key, minutes);
        }
        return minutes;
    }

    function measure($element, $bubble){
        var scrollTop = $window.scrollTop(),
            viewportHeight = $window.height(),
            readableTop = $element.position().top,
            readableHeight = $element.height(),
            readableBottom = readableTop + readableHeight,
            scrollHeight = viewportHeight / readableHeight * viewportHeight,
            progress = (scrollTop - readableTop) / (readableHeight - viewportHeight),
            total = getTotalMinutes($element),
            remaining = Math.ceil(total - (total * progress)),
            distanceProgress = (scrollTop - readableTop) / readableHeight,
            distanceLiteral = readableTop + distanceProgress * readableHeight + viewportHeight / 2 - $bubble.height() / 2,
            distance = Math.max(readableTop, Math.min(distanceLiteral, readableBottom));

        return {
            remaining: remaining,
            progress: progress,
            distance: distance
        };
    }

    slice = function(){
        var scrollTop = $window.scrollTop();
        if (scrollTop !== lastScrollTop){
            all.forEach(function(plugins){
                plugins.forEach(function(plugin){
                    update(plugin);
                });
            });
        }
        lastScrollTop = scrollTop;
        sliceTimer = setTimeout(slice, 500);
    };

    $.fn.readingTime = function(options){
        var these = this.map(function(){
            var key = 'plugin_readingTime',
                plugin = $.data(this, key);

            if(!plugin) {
                plugin = new Plugin(this, options);
                $.data(this, key, plugin);
            }

            return plugin;
        }).get(), i = ++lastId;

        if(all.length === 0){
            slice();
        }

        all[i] = these;

        return {
            destroy: function(){
                delete all[i];

                if(all.length === 0){
                    clearTimeout(sliceTimer);
                }
            }
        };
    };
}(jQuery, window, document);