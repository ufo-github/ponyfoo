'use strict';

var _ = require('lodash');
var contra = require('contra');
var queso = require('queso');
var assign = require('assignment');
var moment = require('moment');
var colorService = require('../../services/color');
var datetimeService = require('../../services/datetime');
var browserEnv = require('../../client/js/lib/env');
var mapsKey = browserEnv('GOOGLE_MAPS_API_KEY');
var Engagement = require('../../models/Engagement');
var Presentation = require('../../models/Presentation');
var pastTagMap = {
  speaking: 'spoke',
  organizing: 'organized',
  attending: 'attended'
};

function home (req, res, next) {
  getModelData(function got (err, data) {
    if (err) {
      next(err); return;
    }
    var upcoming = _.sortBy(data.engagements.filter(hasNotEnded), 'end');
    var diff = _.difference(data.engagements, upcoming);
    var past = _.sortBy(diff, 'end').reverse();
    res.viewModel = {
      model: {
        title: 'Conference Talks presented by Nicolás Bevacqua',
        engagements: {
          upcoming: upcoming.map(toEngagementModel),
          past: past.map(toEngagementModel),
          fullMap: getFullMap(data.engagements)
        },
        presentations: data.presentations.map(toPresentationModel)
      }
    };
    next();
  });
}

function getModelData (done) {
  contra.concurrent({
    engagements: function (next) {
      Engagement.find({}).lean().exec(next);
    },
    presentations: function (next) {
      Presentation.find({}).sort('-presented').lean().exec(next);
    }
  }, done);
}

function toPresentationModel (presentation) {
  return {
    presented: datetimeService.field(presentation.presented),
    title: presentation.title,
    slug: presentation.slug,
    description: presentation.descriptionHtml,
    youtube: presentation.youtube,
    vimeo: presentation.vimeo,
    speakerdeck: presentation.speakerdeck,
    resources: presentation.resources.map(function (resource) {
      return {
        title: resource.titleHtml,
        url: resource.url
      };
    })
  };
}

function getFullMap (engagements) {
  return getMapImageUrl(engagements.map(toPlace), {
    size: '1200x300',
    style: 'all|saturation:-100'
  });
  function toPlace (engagement) {
    return {
      location: engagement.location,
      color: getMarkerColor(engagement),
      size: getMarkerSize(engagement)
    };
  }
}

function getMarkerColor (engagement) {
  var upcoming = hasNotEnded(engagement);
  var color = colorService[upcoming ? 'pink' : 'black'];
  var hex = '0x' + color;
  return hex;
}

function getMarkerSize (engagement) {
  return 'tiny';
}

function toEngagementModel (engagement, i) {
  var upcoming = hasNotEnded(engagement);
  var model = {
    range: datetimeService.range(engagement.start, engagement.end),
    conference: engagement.conference,
    website: engagement.website,
    venue: engagement.venue,
    map: {
      link: 'https://maps.google.com?q=' + encodeURIComponent(engagement.location).replace(/%20/g, '+'),
      image: getMapImageUrl([{
        location: engagement.location,
        color: getMarkerColor(engagement),
        size: getMarkerSize(engagement)
      }], { scale: 17 })
    },
    tags: engagement.tags.map(toTagText)
  };
  return model;
  function toTagText (tag) {
    return upcoming ? tag : pastTagMap[tag] || tag;
  }
}

function hasStarted (engagement) {
  return moment(engagement.start).startOf('day').isBefore(moment());
}

function hasNotEnded (engagement) {
  return moment(engagement.end).endOf('day').isAfter(moment());
}

function getMapImageUrl (places, options) {
  var base = 'https://maps.googleapis.com/maps/api/staticmap';
  var defaults = {
    scale: 2,
    size: '600x300',
    maptype: 'roadmap',
    key: mapsKey
  };
  var qs = queso.stringify(assign({}, defaults, options));
  var markers = places.reduce(getMarker, '');
  return base + qs + markers;
}

function getMarker (all, place) {
  var marker = Object.keys(place).reduce(getProps, '');
  return all + '&markers=' + encodeURIComponent(marker) + place.location;
  function getProps (props, key) {
    if (key === 'location') {
      return props;
    }
    return props + key + ':' + place[key] + '|';
  }
}

module.exports = home;
