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
            
            bubble.attr('title', 'Time left to read the rest of this article');
            bubble.appendTo(plugin.$element);
            bubble.on('mouseenter', function(){
                plugin.stopFading();
                plugin.fadeBubble(1);
            });
            bubble.on('mouseleave', function(){
                plugin.startFading();
                plugin.fadeBubble(0.4);
            });

            putTotalMinutes(plugin.$element);
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
        },
        stopFading: function(){
            if(this.fade_timer){
                clearTimeout(this.fade_timer);
            }
        },
        startFading: function(){
            var plugin = this;

            plugin.fade_timer = setTimeout(function(){
                plugin.fadeBubble(0);
            }, 1500);
        },
        fadeBubble: function(value){
            this.$bubble.stop().animate({opacity: value});
        },
        update: function update(){
            var plugin = this,
                measurements = measure(plugin.$element),
                text = getBubbleText(measurements),
                readable = plugin.isReadable();

            if(readable && text){
                if($window.width() >= 768){
                    plugin.$bubble.css('top', measurements.distance).text(text);
                    plugin.fadeBubble(0.4);
                }

                // fade out the annotation after a second of no scrolling through.
                plugin.stopFading();
                plugin.startFading();
            }
        }
    };

    function getBubbleText(measurements){
        if(measurements.progress >= 1) {
            return 'almost!';
        }
        var minutes = Math.max(1, measurements.remaining);
        return minutes + ' min.';
    }

    function calculateTotalMinutes($element){
        var text = $element.text(),
            stripped = text.replace(rtrimspaces, ' '),
            words = stripped.split(' ').length,
            wordsPerMinute = 200,
            minutes = Math.round(words / wordsPerMinute);

        return minutes;
    }

    function putTotalMinutes($element){
        var minutes = calculateTotalMinutes($element),
            labelTime = minutes ? minutes + ' minutes' : 'less than a minute',
            label = 'reading time: ' + labelTime;

        $element.data('readingTime-minutes', minutes);
        $element.find('.reading-label').text(label);
    }

    function measure($element){
        var scrollTop = $window.scrollTop(),
            readTop = $element.position().top,
            differenceTop = scrollTop - readTop,
            totalHeight = $window.height(),
            readHeight = $element.height();

        function calculateReadProgress(){
            var progress = differenceTop / (readHeight - totalHeight),
                bounded = Math.max(0, Math.min(progress, 1));

            return bounded; // progress bounded within 0..1
        }

        function calculateRemaining(progress){
            var total = $element.data('readingTime-minutes'),
                remaining = Math.ceil(total - total * progress);

            return remaining; // total minutes remaining
        }

        function calculateDistanceFromTop(){
            var readBottom = readTop + readHeight,
                readProgress = differenceTop / readHeight,
                distance = readTop + readProgress * readHeight + totalHeight / 2,
                bounded = Math.max(readTop, Math.min(distance, readBottom));

            return bounded; // absolute distance from { top: 0 }, bounded within $element
        }

        var progress = calculateReadProgress();

        return {
            remaining: calculateRemaining(progress),
            progress: progress,
            distance: calculateDistanceFromTop()
        };
    }

    slice = function(){
        var scrollTop = $window.scrollTop();
        if (scrollTop !== lastScrollTop){
            all.forEach(function(plugins){
                plugins.forEach(function(plugin){
                    plugin.update();
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