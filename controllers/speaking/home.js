'use strict'

const _ = require(`lodash`)
const contra = require(`contra`)
const queso = require(`queso`)
const assign = require(`assignment`)
const moment = require(`moment`)
const env = require(`../../lib/env`)
const browserEnv = require(`../../client/js/lib/env`)
const staticService = require(`../../services/static`)
const colorService = require(`../../services/color`)
const datetimeService = require(`../../services/datetime`)
const presentationService = require(`../../services/presentation`)
const Engagement = require(`../../models/Engagement`)
const Presentation = require(`../../models/Presentation`)
const mapsKey = browserEnv(`GOOGLE_MAPS_API_KEY`)
const authority = env(`AUTHORITY`)
const pastTagMap = {
  speaking: `spoke`,
  organizing: `organized`,
  attending: `attended`
}

function home (req, res, next) {
  getModelData(function got (err, data) {
    if (err) {
      next(err); return
    }
    const upcoming = _.sortBy(data.engagements.filter(hasNotEnded), `end`)
    const diff = _.difference(data.engagements, upcoming)
    const past = _.sortBy(diff, `end`).reverse()
    const fullMap = getFullMap(data.engagements)
    const upcomingModels = upcoming.map(toEngagementModel)
    res.viewModel = {
      model: {
        title: `Conference Talks presented by Nicolás Bevacqua`,
        meta: {
          canonical: `/speaking`,
          images: [
            authority + staticService.unroll(`/img/speaking.jpg`),
            fullMap
          ].concat(
            upcomingModels.map(toEngagementMapImage)
          ),
          description: `Delivering a talk on something I’m passionate about is fun and exciting. I enjoy speaking about all things JavaScript, performance, maintainable code, and the open web.\n\nI’ve delivered workshops on web performance before and I’m also interested in delivering workshops on ES6 as well as all things JavaScript. If you’d like to discuss the possibility of me running a workshop at your event, please use the contact button below and shoot me an email!`
        },
        engagements: {
          upcoming: upcomingModels,
          past: past.map(toEngagementModel),
          fullMap: fullMap
        },
        presentations: data.presentations.map(presentationService.toModel)
      }
    }
    next()
  })
}

function toEngagementMapImage (engagement) {
  return engagement.map.image
}

function getModelData (done) {
  contra.concurrent({
    engagements: function (next) {
      Engagement.find({}).lean().exec(next)
    },
    presentations: function (next) {
      Presentation.find({}).sort(`-presented`).limit(5).lean().exec(next)
    }
  }, done)
}

function getFullMap (engagements) {
  return getMapImageUrl(engagements.map(toPlace), {
    size: `1200x300`,
    style: `all|saturation:-100`
  })
  function toPlace (engagement) {
    const color = getMarkerColor(engagement)
    return {
      location: engagement.location,
      color: `0x` + color,
      size: `tiny`
    }
  }
}

function getMarkerColor (engagement) {
  const upcoming = hasNotEnded(engagement)
  return upcoming ? colorService.colors.pink : colorService.colors.pinkLight.plain
}

function toEngagementModel (engagement) {
  const upcoming = hasNotEnded(engagement)
  const model = {
    range: datetimeService.range(engagement.start, engagement.end),
    conference: engagement.conference,
    website: engagement.website,
    venue: engagement.venue,
    location: engagement.location,
    map: {
      link: `https://maps.google.com?q=` + encodeURIComponent(engagement.location).replace(/(%20|\s)/g, `+`),
      image: getMapImageUrl([{
        location: engagement.location,
        icon: `http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=+%7C` + getMarkerColor(engagement)
      }], { scale: 17 })
    },
    tags: engagement.tags.map(toTagText)
  }
  return model
  function toTagText (tag) {
    return upcoming ? tag : pastTagMap[tag] || tag
  }
}

function hasNotEnded (engagement) {
  return moment.utc(engagement.end).endOf(`day`).isAfter(moment.utc())
}

function getMapImageUrl (places, options) {
  const base = `https://maps.googleapis.com/maps/api/staticmap`
  const defaults = {
    scale: 2,
    size: `600x300`,
    maptype: `roadmap`,
    key: mapsKey
  }
  const qs = queso.stringify(assign({}, defaults, options))
  const markers = places.reduce(getMarker, ``)
  return base + qs + markers
}

function getMarker (all, place) {
  const marker = Object.keys(place).reduce(getProps, ``)
  return all + `&markers=` + encodeURIComponent(marker) + place.location.replace(/(%20|\s)/g, `+`)
  function getProps (props, key) {
    if (key === `location`) {
      return props
    }
    return props + key + `:` + place[key] + `|`
  }
}

module.exports = home
