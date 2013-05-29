!function ($, window, document, undefined) {
    'use strict';

    var lastId = 0,
        $window = $(window),
        $document = $(document),
        rtrimspaces = /\s+/g;

    function Plugin(element) {
        this.$element = $(element);
        this.init();
    }

    Plugin.prototype = {
        init: function (){
            if(this.$element.length !== 1){
                throw new Error('jquery.readingTime must run on a single element at a time.');
            }
            this._id = ++lastId;
            this.$bubble = $('<div/>').addClass('reading-time');
            this.$bubble.appendTo(this.$element);
            
            tick(this);

            $window.on('scroll.readingTime-' + this._id, $.proxy(this.updateScroll, this));
        },
        destroy: function(){
            if(this.tick_timer){
                clearTimeout(this.tick_timer);
            }
            $window.off('scroll.readingTime-' + this._id);
        },
        updateScroll: function(){
            this.scrolled = true;
        },
        update: function(){
            var bubble = this.$bubble,
                measurements = measure(this.$element, bubble),
                text = getBubbleText(measurements),
                readable = this.isReadable();

            if(readable){
                bubble.css('top', measurements.distance).text(text).fadeIn(100);

                // fade out the annotation after a second of no scrolling through.
                if(this.fade_timer){
                    clearTimeout(this.fade_timer);
                }

                this.fade_timer = setTimeout(function() {
                    bubble.fadeOut();
                }, 1000);
            }
        },
        isReadable: function(){
            return this.$element.is(function(){
                var rect = this.getBoundingClientRect(),
                    readable = (
                        rect.bottom > window.innerHeight / 2 &&
                        rect.top < window.innerHeight / 2
                    );

                return readable;
            });
        }
    };

    var tick = function(plugin){
        if (plugin.scrolled){
            plugin.scrolled = false;
            plugin.update();
        }
        plugin.tick_timer = setTimeout(function(){
            tick(plugin);
        }, 5);
    }

    function getBubbleText(measurements){
        if(measurements.remaining > 1){
            return measurements.remaining + ' minutes left';
        }else if(measurements.progress >= 1) {
            return 'Thanks for reading';
        }else if(measurements.remaining <= 1){
            return 'Less than a minute';
        }
    }

    function calculateTotalMinutes(element){
        var text = element.text(),
            stripped = text.replace(rtrimspaces, ' '),
            words = stripped.split(' ').length,
            wordsPerMinute = 200;

        return Math.round(60 * words / wordsPerMinute);
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
            progress = scrollTop / (readableHeight - viewportHeight),
            total = getTotalMinutes($element) / 60,
            remaining = Math.ceil(total - (total * progress)),
            distanceProgress = (scrollTop - readableTop) / readableHeight,
            distanceLiteral = readableTop + distanceProgress * readableHeight + viewportHeight / 2 - $bubble.height() / 2,
            distance = Math.max(readableTop, Math.min(distanceLiteral, readableBottom));

        console.log(distanceLiteral);

        return {
            remaining: remaining,
            progress: progress,
            distance: distance
        };
    }

    $.fn.readingTime = function (options) {
        return this.each(function () {
            if(!$.data(this, 'plugin_readingTime')) {
                $.data(this, 'plugin_readingTime', new Plugin(this, options));
            }
        });
    };
}(jQuery, window, document);