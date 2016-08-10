'use strict';

const $ = require('dominus');
const taunus = require('taunus');
const concurrent = require('contra/concurrent');
const loadScript = require('../../lib/loadScript');
const env = require('../../lib/env');
const mapsKey = env('GOOGLE_MAPS_API_KEY');
const source = 'https://maps.googleapis.com/maps/api/js?key=' + mapsKey + '&libraries=places';
const nullLatLng = {
  lat: 0, lng: 0
};

module.exports = function (viewModel) {
  loadScript(source, function () {
    const google = global.google;
    const gmaps = google.maps;
    const playButton = $('.tkfm-play');
    const stopContainer = $('.tkfm-stop');
    const stopButton = $('.tkfm-stop-button');
    const interactiveMap = $('.tkfm-interactive');
    const interactiveMapEl = interactiveMap[0];
    const mapOptions = {
      center: nullLatLng,
      zoom: 2
    };
    const map = new gmaps.Map(interactiveMapEl, mapOptions);
    const places = new gmaps.places.PlacesService(map);
    const toPink = markMapper('/img/map-pin-e92c6c.png'); // from http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=+|e92c6c
    const toPinkLight = markMapper('/img/map-pin-f4a5c0.png'); // from http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=+|f4a5c0
    const upcoming = viewModel.engagements.upcoming.map(toPink);
    const past = viewModel.engagements.past.map(toPinkLight);
    const all = upcoming.concat(past);
    let openedInfoWindow;

    concurrent(all, 4, ready);

    function ready () {
      playButton.removeClass('tkfm-hidden').on('click', play);
      stopButton.on('click', stop);
    }
    function play () {
      playButton.addClass('tkfm-play-fadeout');
      stopContainer.removeClass('tkfm-hidden');
      interactiveMap
        .removeClass('tkfm-interactive-buried')
        .addClass('tkfm-interactive-opaque');
      setTimeout(showInteractiveMap, 1000);
      function showInteractiveMap () {
        interactiveMap.addClass('tkfm-interactive-loaded');
        playButton.removeClass('tkfm-play-fadeout');
      }
    }
    function stop () {
      stopContainer.addClass('tkfm-hidden');
      interactiveMap.removeClass('tkfm-interactive-opaque');
      setTimeout(hiddenInteractiveMap, 1000);
      function hiddenInteractiveMap () {
        interactiveMap.addClass('tkfm-interactive-buried');
      }
    }

    function markMapper (icon) {
      return function (engagement) {
        return function (next) {
          markPlace(icon, engagement, next);
        };
      };
    }
    function markPlace (icon, engagement, next) {
      places.textSearch({ query: engagement.location }, foundPlace);
      function foundPlace (results, status) {
        if (status === gmaps.places.PlacesServiceStatus.OVER_QUERY_LIMIT) {
          setTimeout(retry, 1000);
          return;
        }
        if (status !== gmaps.places.PlacesServiceStatus.OK) {
          next();
          return;
        }
        const place = results[0];
        if (place) {
          createMarker(place);
        }
        next();
        function retry () {
          markPlace(icon, engagement, next);
        }
        function createMarker (place) {
          const partial = taunus.state.templates['speaking/engagement-infowindow'];
          const infoWindow = new google.maps.InfoWindow({
            content: partial({ engagement: engagement })
          });
          const marker = new gmaps.Marker({
            map: map,
            position: place.geometry.location,
            title: engagement.conference,
            icon: icon
          });
          gmaps.event.addListener(marker, 'click', reveal);
          gmaps.event.addListener(infoWindow, 'closeclick', closing);
          function closing () {
            if (openedInfoWindow) {
              openedInfoWindow.close();
              openedInfoWindow = null;
            }
          }
          function reveal () {
            closing();
            infoWindow.open(map, marker);
            openedInfoWindow = infoWindow;
          }
        }
      }
    }
  });
};
