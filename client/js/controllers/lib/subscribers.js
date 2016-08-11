'use strict';

const cloneDeep = require('lodash//cloneDeep');
const $ = require('dominus');
const moment = require('moment');
const debounce = require('lodash/debounce');
const loadScript = require('../../lib/loadScript');
const colors = ['#cbc5c0', '#1a4d7f', '#55acee', '#1bc211', '#900070', '#e92c6c', '#f3720d', '#ffe270'];

module.exports = function (viewModel, container) {
  const graphData = viewModel.subscriberGraph;

  loadD3(loadD3tip.bind(null, loaded));

  function loadD3 (next) { loadScript('/js/d3.js', next); }
  function loadD3tip (next) { loadScript('/js/d3-tip.js', next); }
  function loaded () {
    const d3 = global.d3;
    const d3tip = global.d3Tip;
    const renderTimely = debounce(render, 300);

    d3tip(d3);

    render();
    $(window).on('resize', renderTimely);
    $('#sg-show-subscribers').on('change', render);
    $('#sg-show-pageviews').on('change', render);
  }

  function render () {
    const d3 = global.d3;
    const parent = $.findOne('.sg-container', container);
    const showSubscribers = $('#sg-show-subscribers', container).value();
    const showPageViews = $('#sg-show-pageviews', container).value();

    $('.sg-chart', container).remove();

    const rect = parent.getBoundingClientRect();
    const margin = {
      top: 20, right: 20, bottom: 30, left: 40
    };
    const dx = rect.right - rect.left;
    const unboundHeight = Math.ceil(dx / 1.5) - margin.top - margin.bottom;
    const width = dx - margin.left - margin.right;
    const height = Math.max(unboundHeight, 300);
    const svg = d3
      .select('.sg-container')
      .append('div')
      .classed('sg-chart', true)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${ margin.left },${ margin.top })`);

    const x = d3.scale
      .ordinal()
      .rangeRoundBands([0, width], 0.1);

    const y = d3.scale
      .linear()
      .rangeRound([height - 150, 0]);

    const data = cloneDeep(graphData.subscribers);
    const color = d3.scale
      .ordinal()
      .range(colors);

    prepareDomain();
    addTimeAxis();

    if (showSubscribers) {
      addSubscribers();
    }
    if (showPageViews) {
      addPageViews(x(data[0].dateText), x(data[data.length - 1].dateText) + x.rangeBand());
    }

    function prepareDomain () {
      color.domain(d3.keys(data[0]).filter(function (key) { return key !== 'date' && key !== 'dateText'; }));

      data.forEach(function (d) {
        let currentHeight = 0;
        d.date = new Date(d.date);
        d.fragments = color.domain().map(name => {
          const y0 = currentHeight;
          const y1 = currentHeight += +d[name];
          return { name, y0, y1, d };
        });
        d.total = d.unverified + d.migration + d.twitter + d.sidebar + d.comment + d.article + d.landed + d.weekly;
      });
      data.sort(function (a, b) { return moment(a.date).isAfter(b.date) ? 1 : -1; });

      x.domain(data.map(function (d) { return d.dateText; }));
      y.domain([0, d3.max(data, function (d) { return d.total; })]);
    }

    function addTimeAxis () {
      const xAxis = d3.svg
        .axis()
        .scale(x)
        .orient('bottom');

      svg.append('g')
        .attr('class', 'sg-x sg-axis')
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
    }

    function addSubscribers () {
      addStackedBarChart();
      addSubscribersAxis();
      addLegends();
      addTips();

      function addStackedBarChart () {
        const date = svg.selectAll('.date')
          .data(data)
          .enter().append('g')
          .attr('class', 'sg-g')
          .attr('transform', function (d) { return 'translate(' + x(d.dateText) + ',0)'; });

        date.selectAll('.sg-bar')
          .data(function (d) { return d.fragments; })
          .enter().append('rect')
          .attr('class', 'sg-bar')
          .attr('width', x.rangeBand())
          .attr('y', function (d) { return y(d.y1); })
          .attr('height', function (d) { return y(d.y0) - y(d.y1); })
          .style('fill', function (d) { return color(d.name); });
      }

      function addSubscribersAxis () {
        if (showPageViews) {
          return;
        }
        const yAxis = d3.svg
          .axis()
          .scale(y)
          .orient('left')
          .tickFormat(d3.format('.2s'));

        svg.append('g')
          .attr('class', 'sg-y sg-axis')
          .call(yAxis)
          .append('text')
          .attr('transform', 'rotate(-90)')
          .attr('y', 6)
          .attr('dy', '.71em')
          .style('text-anchor', 'end')
          .text('Subscribers per week');
      }

      function addLegends () {
        const legend = svg.selectAll('.legend')
          .data(color.domain().slice().reverse())
          .enter().append('g')
          .attr('class', 'sg-legend')
          .attr('transform', function (d, i) { return 'translate(-' + (width - 160) + ',' + i * 20 + ')'; });

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
          .text(function (d) { return d; });
      }

      function addTips () {
        const tip = d3.tip()
          .attr('class', 'sg-tip')
          .direction('e')
          .offset([-10, 0])
          .html(function (d) {
            const full = d.d;
            const i = data.indexOf(full);
            const oldIndex = i - 1;
            const old = oldIndex < 0 ? 0 : data[oldIndex].total - data[oldIndex].unverified;
            const now = full.total - full.unverified;
            const { name } = d;
            const c = color(name);
            return `
<div class="sg-tip-content" style="color: ${ c === '#ffe270' ? '#333' : '#fbf9ec' }; background-color: ${ c };">
  <div>
    <span class="sg-tip-label">${ name }:</span>
     ${ full[name] } (${ diffText(data[oldIndex][name], full[name]) })
  </div>
  <div>Overall: ${ now } (${ diffText(old, now) })</div>
</div>`;
          });

        svg.call(tip);
        svg
          .selectAll('rect')
          .on('mouseover', function (d) {
            if (d.y1 - d.y0 > 0) { tip.show(d); }
          });

        $(parent).on('mouseleave', tip.hide);
      }
    }

    function addPageViews (x1, x2) {
      let peak = 0;
      const pv = cloneDeep(graphData.pageviews);
      if (!pv || pv.length === 0) {
        return;
      }
      pv.forEach(pv => {
        pv.date = new Date(pv.date);
        if (peak < pv.views) {
          peak = pv.views;
        }
      });

      const x = d3.time.scale().range([x1, x2]);
      const y = d3.scale.linear().rangeRound([height - 150, 0]);

      const line = d3.svg.line()
        .x(d => x(d.date))
        .y(d => y(d.views));

      x.domain(d3.extent(pv, function (d) { return d.date; }));
      y.domain(d3.extent(pv, function (d) { return d.views; }));

      addPageViewsAxis();
      addLinearGradient();
      addPageViewsShadow();
      addPageViewsPath();

      function addPageViewsAxis () {
        const yAxis = d3.svg
          .axis()
          .scale(y)
          .orient('left')
          .tickFormat(d3.format('.2s'));

        svg.append('g')
          .attr('class', 'sg-y sg-axis')
          .call(yAxis)
          .append('text')
          .attr('transform', 'rotate(-90)')
          .attr('y', 6)
          .attr('dy', '.71em')
          .style('text-anchor', 'end')
          .text('Page views per day');
      }

      function addLinearGradient () {
        svg.append('linearGradient')
          .attr('id', 'sg-pageviews-gradient')
          .attr('gradientUnits', 'userSpaceOnUse')
          .attr('x1', 0).attr('y1', y(0))
          .attr('x2', 0).attr('y2', y(peak))
          .selectAll('stop')
          .data([
            { offset: '0%', color: '#55acee' },
            { offset: '25%', color: '#900070' },
            { offset: '100%', color: '#e92c6c' }
          ])
          .enter().append('stop')
          .attr('offset', d => d.offset)
          .attr('stop-color', d => d.color);
      }

      function addPageViewsShadow () {
        svg
          .append('path')
          .datum(pv)
          .attr('class', 'sg-pageviews-shadow')
          .attr('d', line);
      }

      function addPageViewsPath () {
        svg
          .append('path')
          .datum(pv)
          .attr('class', 'sg-pageviews')
          .attr('stroke', 'url(#sg-pageviews-gradient)') // relative url in css is relative to stylesheet, better have it here
          .attr('d', line);
      }
    }
  }
};

function diffText (old, now) {
  const diff = old === 0 ? 100 : (now === 0 ? -100 : (now - old) / Math.abs(old) * 100);
  const sign = diff < 0 ? '' : '+';
  const fixed = diff.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
  return sign + fixed + '%';
}
