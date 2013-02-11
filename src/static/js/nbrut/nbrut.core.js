!function (window, $, undefined) {
    var caching = function(){
        function setCookie(key, value, expires) {
            var defaults = {
                path: '/',
                expires: 1000 * 60 * 60 * 6 * 24 * 30 // 6 months
            };
            var date = new Date();
            var offset = expires || defaults.expires;
            date.setTime(date.getTime() + offset);
            var json = window.JSON.stringify(value);
            var cookie = '{0}={1}; expires={2}; path={3}'.format(key, json, date.toGMTString(), defaults.path);
            document.cookie = cookie;
        }

        function getCookie(key, defaultValue) {
            var identifier = '{0}='.format(key);
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = cookies[i];
                while (cookie.charAt(0) == ' ') {
                    cookie = cookie.substring(1, cookie.length);
                }
                if (cookie.indexOf(identifier) == 0) {
                    var value = cookie.substring(identifier.length, cookie.length);
                    return $.parseJSON(value);
                }
            }
            return defaultValue;
        }

        function setStorageItem(key, value) {
            var localStorage = window.localStorage;
            if (localStorage) {
                try {
                    localStorage.setItem(key, window.JSON.stringify(value));
                } catch (e) {
                }
            }
            return !!localStorage;
        }

        function getStorageItem(key, defaultValue) {
            var localStorage = window.localStorage;
            if (localStorage) {
                var value = localStorage.getItem(key);
                if (value) {
                    return $.parseJSON(value);
                }
            }
            return defaultValue;
        }

        function setPreference(key, value, expires) {
            if (!setStorageItem(key, value)) {
                setCookie(key, value, expires);
            }
        }

        function getPreference(key, defaultValue) {
            var fromStorage = getStorageItem(key, defaultValue);
            if (fromStorage === defaultValue || fromStorage === undefined) {
                return getCookie(key, defaultValue);
            } else {
                return fromStorage;
            }
        }

        function clearStorage() {
            var localStorage = window.localStorage;
            if (localStorage) {
                localStorage.clear();
            }
        }

        return {
            set: setStorageItem,
            get: getStorageItem,
            clear: clearStorage,

            // intended for smaller chunks of data
            setPref: setPreference,
            getPref: getPreference
        };
    }();

    window.nbrut = {
        local: caching
    };
}(window, jQuery);