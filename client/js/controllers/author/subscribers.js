'use strict';

var loadScript = require('../../lib/loadScript');
var moment = require('moment');

function pullData (subscribers) {
  var data = [];
  var subscriber;
  var week;
  var curr;
  while (subscribers.length) {
    subscriber = subscribers.pop();
    week = moment(subscriber.created).subtract(7, 'days');
    curr = {
      moment: week,
      date: week.format('Do MMMM ’YY'),
      migration: 0,
      sidebar: 0,
      comment: 0,
      article: 0
    };
    add();
    while (subscribers.length) {
      subscriber = subscribers.pop();
      if (moment(subscriber.created).isAfter(week)) {
        add();
      } else {
        break;
      }
    }
    data.push(curr);
  }
  return data;
  function add () {
    curr[source()]++;
  }
  function source () {
    return subscriber.source === 'intent' ? 'sidebar' : subscriber.source;
  }
}

module.exports = function (viewModel, container) {
  loadScript('/js/d3.js', function () {
    var parent = container.getElementsByClassName('as-container')[0];
    var rect = parent.getBoundingClientRect();
    var margin = {
      top: 20, right: 20, bottom: 30, left: 40
    };
    var width = rect.right - rect.left - margin.left - margin.right;
    var height = Math.ceil((rect.right - rect.left) / 1) - margin.top - margin.bottom;

    var data = pullData(viewModel.subscribers);

    var x = d3.scale
      .ordinal()
      .rangeRoundBands([0, width], .1);

    var y = d3.scale
      .linear()
      .rangeRound([height - 150, 0]);

    var color = d3.scale
      .ordinal()
      .range(['#8a89a6', '#7b6888', '#6b486b', '#9755b4']);

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
      .select('.as-chart')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    color.domain(d3.keys(data[0]).filter(function(key) { return key !== 'moment' && key !== 'date'; }));

    data.forEach(function(d) {
      var y0 = 0;
      d.fragments = color.domain().map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name]}; });
      d.total = d.migration + d.sidebar + d.comment + d.article;
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

    date.selectAll('rect')
      .data(function(d) { return d.fragments; })
      .enter().append('rect')
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

  });
};
