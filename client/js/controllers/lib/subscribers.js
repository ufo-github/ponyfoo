'use strict';

const cloneDeep = require(`lodash//cloneDeep`);
const $ = require(`dominus`);
const moment = require(`moment`);
const debounce = require(`lodash/debounce`);
const loadScript = require(`../../lib/loadScript`);

function isLightColor (color) {
  return color === `#e0e0e0` || color === `#cbc5c0` || color === `#ffe270`;
}

module.exports = function (viewModel, container) {
  const graphData = viewModel.subscriberGraph;

  loadD3(loadD3tip.bind(null, loaded));

  function loadD3 (next) { loadScript(`/js/d3.js`, next); }
  function loadD3tip (next) { loadScript(`/js/d3-tip.js`, next); }
  function loaded () {
    const d3 = global.d3;
    const d3tip = global.d3Tip;
    const renderTimely = debounce(render, 300);
    const dimensions = {
      migration: { color: `#e0e0e0`, enabled: true },
      unverified: { color: `#cbc5c0`, enabled: true },
      twitter: { color: `#55acee`, enabled: true },
      bubble: { color: `#1a4d7f`, enabled: true },
      weekly: { color: `#1bc211`, enabled: true },
      sidebar: { color: `#900070`, enabled: true },
      comment: { color: `#e92c6c`, enabled: true },
      article: { color: `#f3720d`, enabled: true },
      landed: { color: `#ffe270`, enabled: true }
    };
    const legends = {
      landed: `landing`
    };
    const legendsReverse = Object.keys(legends).reduce(reverseLegendReducer, {});

    d3tip(d3);
    render();

    $(window).on(`resize`, renderTimely);
    $(`#sg-show-subscribers`).on(`change`, render);
    $(`#sg-show-pageviews`).on(`change`, render);
    $(`#sg-wow-mode`).on(`change`, render);
    $(`.sg-container`).on(`click`, `.sg-legend`, toggleDimension);

    function getEnabledDimensions () {
      return Object
        .keys(dimensions)
        .filter(dimension => dimensions[dimension].enabled);
    }

    function getEnabledColors () {
      return getEnabledDimensions().map(dimension => dimensions[dimension].color);
    }

    function toggleDimension (e) {
      const $el = $(e.target).parents(`.sg-legend`).and(e.target).where(`.sg-legend`);
      const legend = $el.find(`text`).text();
      const dimension = legendsReverse[legend] || legend;
      const before = dimensions[dimension].enabled;
      dimensions[dimension].enabled = !before;
      render();
    }

    function render () {
      const d3 = global.d3;
      const parent = $.findOne(`.sg-container`, container);
      const showSubscribers = $(`#sg-show-subscribers`, container).value();
      const showPageViews = $(`#sg-show-pageviews`, container).value();
      const wowMode = $(`#sg-wow-mode`, container).value();

      $(`.sg-chart`, container).remove();
      $(`.sg-tip`).remove();

      const rect = parent.getBoundingClientRect();
      const margin = {
        top: 20, right: 20, bottom: 30, left: 40
      };
      const dx = rect.right - rect.left;
      const unboundHeight = Math.ceil(dx / 1.5) - margin.top - margin.bottom;
      const width = dx - margin.left - margin.right;
      const height = Math.max(unboundHeight, 300);
      const svg = d3
        .select(`.sg-container`)
        .append(`div`)
        .classed(`sg-chart`, true)
        .append(`svg`)
        .attr(`width`, width + margin.left + margin.right)
        .attr(`height`, height + margin.top + margin.bottom)
        .append(`g`)
        .attr(`transform`, `translate(${ margin.left },${ margin.top })`);

      const x = d3.scale
        .ordinal()
        .rangeRoundBands([0, width], 0.1);

      const y = d3.scale
        .linear()
        .rangeRound([height - 150, 0]);

      const data = cloneDeep(graphData.subscribers);
      const color = d3.scale
        .ordinal()
        .range(getEnabledColors());

      prepareDomain();
      addTimeAxis();

      if (showSubscribers) {
        addSubscribers();
      }
      if (showPageViews) {
        addPageViews(x(data[0].dateText), x(data[data.length - 1].dateText) + x.rangeBand());
      }

      function prepareDomain () {
        color.domain(getEnabledDimensions());

        data
          .sort((a, b) => moment(a.date).isAfter(b.date) ? 1 : -1)
          .forEach((d, i) => {
            const types = Object.keys(dimensions);
            if (!(wowMode || i === 0)) {
              types.forEach(type => d[type] += data[i - 1][type]);
            }
            let currentHeight = 0;
            d.date = new Date(d.date);
            d.fragments = color.domain().map(name => {
              const y0 = currentHeight;
              const y1 = currentHeight += +d[name];
              return { name, y0, y1, d };
            });
            d.total = getEnabledDimensions().reduce((total, type) => total + d[type], 0);
            if (!dimensions.unverified.enabled) {
              d.unverified = 0;
            }
          });

        x.domain(data.map(d => d.dateText));
        y.domain([0, d3.max(data, d => d.total)]);
      }

      function addTimeAxis () {
        const xAxis = d3.svg
          .axis()
          .scale(x)
          .orient(`bottom`);

        svg.append(`g`)
          .attr(`class`, `sg-x sg-axis`)
          .attr(`transform`, `translate(0,` + height + `)`)
          .call(xAxis)
          .selectAll(`text`)
          .attr(`y`, 0)
          .attr(`x`, -140)
          .attr(`dy`, `.35em`)
          .attr(`transform`, `rotate(70) translate(10,-45)`)
          .style(`text-anchor`, `start`)
          .each(function (d, i) {
            if (i % 2 !== 0) {
              this.innerHTML = ``;
            }
          });
      }

      function addSubscribers () {
        addStackedBarChart();
        addSubscribersAxis();
        addLegends();
        addTips();

        function addStackedBarChart () {
          const date = svg.selectAll(`.date`)
            .data(data)
            .enter().append(`g`)
            .attr(`class`, `sg-g`)
            .attr(`transform`, d => `translate(${ x(d.dateText) },0)`);

          date.selectAll(`.sg-bar`)
            .data(d => d.fragments)
            .enter().append(`rect`)
            .attr(`class`, `sg-bar`)
            .attr(`width`, x.rangeBand() + (wowMode ? 0 : 1))
            .attr(`y`, d => y(d.y1))
            .attr(`height`, d => y(d.y0) - y(d.y1))
            .style(`fill`, d => color(d.name));
        }

        function addSubscribersAxis () {
          if (showPageViews) {
            return;
          }
          const yAxis = d3.svg
            .axis()
            .scale(y)
            .orient(`left`)
            .tickFormat(d3.format(`.2s`));

          svg.append(`g`)
            .attr(`class`, `sg-y sg-axis`)
            .call(yAxis)
            .append(`text`)
            .attr(`transform`, `rotate(-90)`)
            .attr(`y`, 6)
            .attr(`dy`, `.71em`)
            .style(`text-anchor`, `end`)
            .text(wowMode ? `Subscribers per week` : `Total subscribers`);
        }

        function addLegends () {
          const legend = svg.selectAll(`.legend`)
            .data(Object.keys(dimensions).reverse())
            .enter().append(`g`)
            .attr(`class`, dimension => {
              const { enabled } = dimensions[dimension];
              return `sg-legend${ enabled ? `` : ` sg-legend-disabled` }`;
            })
            .attr(`transform`, (d, i) => `translate(-${ width - 160 },${ i * 20 })`);

          legend.append(`rect`)
            .attr(`x`, width - 18)
            .attr(`width`, 18)
            .attr(`height`, 18)
            .style(`fill`, dimension => dimensions[dimension].color);

          legend.append(`text`)
            .attr(`x`, width - 24)
            .attr(`y`, 9)
            .attr(`dy`, `.35em`)
            .style(`text-anchor`, `end`)
            .text(d => legends[d] || d);
        }

        function addTips () {
          const tip = d3.tip()
            .attr(`class`, `sg-tip`)
            .direction(`e`)
            .offset([-10, 0])
            .html(d => {
              const full = d.d;
              const i = data.indexOf(full);
              const oldIndex = i - 1;
              const old = oldIndex < 0 ? 0 : data[oldIndex].total - data[oldIndex].unverified;
              const now = full.total;
              const verified = now - full.unverified;
              const { name } = d;
              const c = color(name);
              const tipClass = isLightColor(c) ? `sg-tip-light` : `sg-tip-dark`;
              return `
<div class="sg-tip-content ${ tipClass }" style="background-color: ${ c };">
  <div class="sg-tip-date">${ full.dateText }</div>
  <div>
    <span class="sg-tip-label">${ name }: </span>
    <span class="sg-tip-numbers">${ full[name] } ${ diffText(data[oldIndex][name], full[name]) }</span>
  </div>
  <div>
    <span class="sg-tip-label">Verified: </span>
    <span class="sg-tip-numbers">${ verified } ${ diffText(old, verified) }</span>
  </div>
  <div>
    <span class="sg-tip-label">Total: </span>
    <span class="sg-tip-numbers">${ now } ${ diffText(old, now) }</span>
  </div>
</div>`;
            });

          svg.call(tip);
          svg
            .selectAll(`rect`)
            .on(`mouseover`, d => {
              if (d.y1 - d.y0 > 0) { tip.show(d); }
            });

          $(parent).on(`mouseleave`, tip.hide);
        }
      }

      function addPageViews (x1, x2) {
        let peak = 0;
        const pv = cloneDeep(graphData.pageviews);
        if (!pv || pv.length === 0) {
          return;
        }
        pv.forEach((cpv, i) => {
          cpv.date = new Date(cpv.date);
          if (!(wowMode || i === 0)) {
            cpv.views += pv[i - 1].views;
          }
          if (peak < cpv.views) {
            peak = cpv.views;
          }
        });

        const x = d3.time.scale().range([x1, x2]);
        const y = d3.scale.linear().rangeRound([height - 150, 0]);

        const line = d3.svg.line()
          .x(d => x(d.date))
          .y(d => y(d.views));

        x.domain(d3.extent(pv, d => d.date));
        y.domain(d3.extent(pv, d => d.views));

        addPageViewsAxis();
        addLinearGradient();
        addPageViewsShadow();
        addPageViewsPath();

        function addPageViewsAxis () {
          const yAxis = d3.svg
            .axis()
            .scale(y)
            .orient(`left`)
            .tickFormat(d3.format(`.2s`));

          svg.append(`g`)
            .attr(`class`, `sg-y sg-axis`)
            .call(yAxis)
            .append(`text`)
            .attr(`transform`, `rotate(-90)`)
            .attr(`y`, 6)
            .attr(`dy`, `.71em`)
            .style(`text-anchor`, `end`)
            .text(wowMode ? `Page views per day` : `Total page views`);
        }

        function addLinearGradient () {
          svg.append(`linearGradient`)
            .attr(`id`, `sg-pageviews-gradient`)
            .attr(`gradientUnits`, `userSpaceOnUse`)
            .attr(`x1`, 0).attr(`y1`, y(0))
            .attr(`x2`, 0).attr(`y2`, y(peak))
            .selectAll(`stop`)
            .data([
              { offset: `0%`, color: `#55acee` },
              { offset: `25%`, color: `#900070` },
              { offset: `100%`, color: `#e92c6c` }
            ])
            .enter().append(`stop`)
            .attr(`offset`, d => d.offset)
            .attr(`stop-color`, d => d.color);
        }

        function addPageViewsShadow () {
          svg
            .append(`path`)
            .datum(pv)
            .attr(`class`, `sg-pageviews-shadow`)
            .attr(`d`, line);
        }

        function addPageViewsPath () {
          svg
            .append(`path`)
            .datum(pv)
            .attr(`class`, `sg-pageviews`)
            .attr(`stroke`, `url(#sg-pageviews-gradient)`) // relative url in css is relative to stylesheet, better have it here
            .attr(`d`, line);
        }
      }
    }

    function reverseLegendReducer (reverse, key) {
      reverse[legends[key]] = key;
      return reverse;
    }
  }
};

function diffText (old, now) {
  const diff = old === 0 ? 100 : (now === 0 ? -100 : (now - old) / Math.abs(old) * 100);
  const sign = diff < 0 ? `` : `+`;
  const fixed = diff.toFixed(1).replace(/0+$/, ``).replace(/\.$/, ``);
  const css = diff < 0 ? `sg-diff-negative` : `sg-diff-positive`;
  return `<span class='sg-diff ${css}'>${ sign }${ fixed }%</span>`;
}
