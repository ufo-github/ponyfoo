'use strict';

var $ = require('dominus');
var moment = require('moment');
var debounce = require('lodash/function/debounce');
var loadScript = require('../../lib/loadScript');
var textService = require('../../../../services/text');

function pullData (subscribers) {
  var copy = subscribers.slice();
  var data = [];
  var subscriber;
  var week;
  var current;
  while (copy.length) {
    subscriber = copy.pop();
    week = moment(subscriber.created).subtract(7, 'days');
    current = {
      moment: week,
      date: week.format('Do MMMM ’YY'),
      migration: 0,
      unverified: 0,
      sidebar: 0,
      comment: 0,
      article: 0,
      landed: 0
    };
    add();
    while (copy.length) {
      subscriber = copy.pop();
      if (moment(subscriber.created).isAfter(week)) {
        add();
      } else {
        break;
      }
    }
    data.push(current);
  }
  return data;
  function add () {
    current[source()]++;
  }
  function source () {
    if (subscriber.verified) {
      return subscriber.source === 'intent' ? 'sidebar' : subscriber.source;
    }
    return 'unverified';
  }
}

module.exports = function (viewModel, container) {
  loadD3(loadD3tip.bind(null, loaded));

  function loadD3 (next) { loadScript('/js/d3.js', next); }
  function loadD3tip (next) { loadScript('/js/d3-tip.js', next); }
  function loaded () {
    var d3 = global.d3;
    var d3tip = global.d3Tip;
    var renderTimely = debounce(render, 300);

    d3tip(d3);

    render();
    $(window).on('resize', renderTimely);
  }

  function render () {
    var d3 = global.d3;
    var parent = $.findOne('.as-container', container);

    $('.as-chart', container).remove();

    var rect = parent.getBoundingClientRect();
    var margin = {
      top: 20, right: 20, bottom: 30, left: 40
    };
    var dx = rect.right - rect.left;
    var unboundHeight = Math.ceil(dx / 1.5) - margin.top - margin.bottom;
    var width = dx - margin.left - margin.right;
    var height = Math.max(unboundHeight, 300);

    var data = pullData(viewModel.subscribers);
    var x = d3.scale
      .ordinal()
      .rangeRoundBands([0, width], 0.1);

    var y = d3.scale
      .linear()
      .rangeRound([height - 150, 0]);

    var color = d3.scale
      .ordinal()
      .range(['#cbc5c0', '#1a4d7f', '#900070', '#e92c6c', '#f3720d', '#ffe270']);

    var xAxis = d3.svg
      .axis()
      .scale(x)
      .orient('bottom');

    var yAxis = d3.svg
      .axis()
      .scale(y)
      .orient('left')
      .tickFormat(d3.format('.2s'));

    var svg = d3
      .select('.as-container')
      .append('div')
      .classed('as-chart', true)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    color.domain(d3.keys(data[0]).filter(function(key) { return key !== 'moment' && key !== 'date'; }));

    data.forEach(function(d) {
      var y0 = 0;
      d.fragments = color.domain().map(function(name) { return { name: name, y0: y0, y1: y0 += +d[name], d: d }; });
      d.total = d.unverified + d.migration + d.sidebar + d.comment + d.article + d.landed;
    });

    data.sort(function(a, b) { return a.moment.isAfter(b.moment) ? 1 : -1; });

    x.domain(data.map(function(d) { return d.date; }));
    y.domain([0, d3.max(data, function(d) { return d.total; })]);

    svg.append('g')
      .attr('class', 'as-x as-axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxis)
      .selectAll('text')
      .attr('y', 0)
      .attr('x', -140)
      .attr('dy', '.35em')
      .attr('transform', 'rotate(70) translate(10,-45)')
      .style('text-anchor', 'start')
      .each(function (d, i) {
        if (i % 2 !== 0) {
          this.innerHTML = '';
        }
      });

    svg.append('g')
      .attr('class', 'as-y as-axis')
      .call(yAxis)
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .text('Subscribers per week');

    var date = svg.selectAll('.date')
      .data(data)
      .enter().append('g')
      .attr('class', 'as-g')
      .attr('transform', function(d) { return 'translate(' + x(d.date) + ',0)'; });

    date.selectAll('.as-bar')
      .data(function(d) { return d.fragments; })
      .enter().append('rect')
      .attr('class', 'as-bar')
      .attr('width', x.rangeBand())
      .attr('y', function(d) { return y(d.y1); })
      .attr('height', function(d) { return y(d.y0) - y(d.y1); })
      .style('fill', function(d) { return color(d.name); });

    var legend = svg.selectAll('.legend')
      .data(color.domain().slice().reverse())
      .enter().append('g')
      .attr('class', 'as-legend')
      .attr('transform', function(d, i) { return 'translate(-' + (width - 160) + ',' + i * 20 + ')'; });

    legend.append('rect')
      .attr('x', width - 18)
      .attr('width', 18)
      .attr('height', 18)
      .style('fill', color);

    legend.append('text')
      .attr('x', width - 24)
      .attr('y', 9)
      .attr('dy', '.35em')
      .style('text-anchor', 'end')
      .text(function(d) { return d; });

    var tip = d3.tip()
      .attr('class', 'as-tip')
      .direction('e')
      .offset([-10, 0])
      .html(function (d) {
        var full = d.d;
        var i = data.indexOf(full);
        var oldIndex = i - 1;
        var old = oldIndex < 0 ? 0 : data[oldIndex].total - data[oldIndex].unverified;
        var now = full.total - full.unverified;
        var c = color(d.name);
        return textService.format([
          '<div class="as-tip-content" style="color: %s; background-color: %s;">',
            '<div>',
              '<span class="as-tip-label">%s:</span>',
              ' %s (%s)',
            '</div>',
            '<div>Overall: %s (%s)</div>',
          '</div>'
          ].join(''),
          c === '#ffe270' ? '#333' : '#fbf9ec',
          c,
          d.name,
          full[d.name],
          diffText(data[oldIndex][d.name], full[d.name]),
          now,
          diffText(old, now)
        );
        function diffText (old, now) {
          var diff = old === 0 ? 100 : (now === 0 ? -100 : (now - old) / Math.abs(old) * 100);
          var sign = diff < 0 ? '' : '+';
          var fixed = diff.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
          return sign + fixed + '%';
        }
      });

    svg.call(tip);
    svg
      .selectAll('rect')
      .on('mouseover', function (d) {
        if (d.y1 - d.y0 > 0) { tip.show(d); }
      });

    $(parent).on('click', tip.hide);
  }
};
