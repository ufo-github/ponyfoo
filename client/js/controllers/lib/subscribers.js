'use strict';

const cloneDeep = require(`lodash//cloneDeep`);
const $ = require(`dominus`);
const moment = require(`moment`);
const debounce = require(`lodash/debounce`);
const loadScript = require(`../../lib/loadScript`);

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
      migration: { enabled: true },
      unverified: { enabled: true },
      sidebar: { enabled: true },
      comment: { enabled: true },
      article: { enabled: true },
      landed: { enabled: true },
      twitter: { enabled: true },
      weekly: { enabled: true },
      bubble: { enabled: true },
      registration: { enabled: true },
      promo: { enabled: true }
    };
    const legends = {
      landed: `landing`,
      migration: `legacy`
    };
    const legendsReverse = Object.keys(legends).reduce(reverseLegendReducer, {});

    d3tip(d3);
    render();

    $(window).on(`resize`, renderTimely);
    $(`.sg-options`).on(`change`, `input, select`, render);
    $(`.sg-container`).on(`click`, `.sg-legend`, toggleDimension);

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
      const unverifiedBuckets = $(`#sg-bucket-subscribers`, container).value();
      const overlayed = $(`#sg-overlay-subscribers`, container).value();
      const pageviewDaysValue = $(`.sg-pageview-daypicker`).value();
      const pageviewDays = pageviewDaysValue && pageviewDaysValue.split(`,`).map(v => parseInt(v, 10));
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

      prepareDomain();
      addTimeAxis();

      if (showSubscribers) {
        addSubscribers();
      }
      if (showPageViews) {
        addPageViews(x(data[0].dateText), x(data[data.length - 1].dateText) + x.rangeBand());
      }

      function prepareDomain () {
        data
          .sort((a, b) => moment(a.date).isAfter(b.date) ? 1 : -1)
          .forEach(massageDatum);

        const yMax = d3.max(data, datum => {
          if (!overlayed) {
            const { total } = datum;
            const { u, v } = total;
            return u + v;
          }
          const dimensions = getEnabledDimensions().map(source => datum[source]);
          const sumAll = ({ u, v }) => u + v;
          return d3.max(dimensions, sumAll);
        });

        x.domain(data.map(datum => datum.dateText));
        y.domain([0, yMax]);

        function massageDatum (datum, i) {
          const computeUnverified = dimensions.unverified.enabled;

          if (!computeUnverified) {
            datum.unverified.v = 0;
          } else if (!unverifiedBuckets) {
            getDisabledDimensions().forEach(source => datum.unverified.v -= datum[source].u);
          }

          datum.fragments = computeFragments();
          datum.total = {};
          computeTotals(`v`);
          computeTotals(`u`);

          function computeFragments () {
            const fragments = [];
            if (!(wowMode || i === 0)) {
              getEnabledDimensions()
                .filter(notUnverifiedBucket)
                .forEach(splashFragments);
            }

            datum.date = new Date(datum.date);
            getEnabledDimensions()
              .forEach(pushFragments);

            let currentHeight = 0;
            return fragments.map(fragmentToDataPoint);

            function splashFragments (source) {
              const { v, u } = data[i - 1][source];
              const d = datum[source];
              d.v += v;
              if (computeUnverified) {
                d.u += u;
              } else {
                d.u = 0;
              }
            }

            function pushFragments (source) {
              if (unverifiedBuckets) {
                fragments.push({ source, datum, vector: `u` });
              }
              fragments.push({ source, datum, vector: `v` });
            }

            function fragmentToDataPoint ({ source, datum, vector }) {
              const height = datum[source][vector];
              const y0 = overlayed ? 0 : currentHeight;
              const y1 = overlayed ? height : currentHeight += height;
              return { source, datum, vector, y0, y1 };
            }
          }

          function computeTotals (vector) {
            datum.total[vector] = getEnabledDimensions()
              .filter(source => source !== `unverified`)
              .reduce((total, source) => total + datum[source][vector], 0);
          }
        }
      }

      function getSourceDimensions () {
        return Object.keys(dimensions).filter(notUnverifiedBucket);
      }

      function getEnabledDimensions () {
        return getSourceDimensions().filter(source => dimensions[source].enabled);
      }

      function getDisabledDimensions () {
        return getSourceDimensions().filter(source => !dimensions[source].enabled);
      }

      function notUnverifiedBucket (source) {
        return !unverifiedBuckets || source !== `unverified`;
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
            .attr(`class`, `sg-g${ overlayed ? ` sg-overlay-subscribers` : `` }`)
            .attr(`transform`, datum => `translate(${ x(datum.dateText) },0)`);

          date.selectAll(`.sg-bar`)
            .data(datum => datum.fragments)
            .enter().append(`rect`)
            .attr(`class`, datum => `sg-bar sg-bar-${datum.vector} sg-source-${datum.source}`)
            .attr(`width`, x.rangeBand() + (wowMode ? 0 : 1))
            .attr(`y`, datum => y(datum.y1))
            .attr(`height`, datum => y(datum.y0) - y(datum.y1));
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
            .attr(`transform`, (datum, i) => `translate(-${ width - 160 },${ i * 20 })`);

          legend.append(`rect`)
            .attr(`x`, width - 18)
            .attr(`width`, 18)
            .attr(`height`, 18)
            .attr(`class`, dimension => `sg-source-${dimension}`);

          legend.append(`text`)
            .attr(`x`, width - 24)
            .attr(`y`, 9)
            .attr(`dy`, `.35em`)
            .style(`text-anchor`, `end`)
            .text(datum => legends[datum] || datum);
        }

        function addTips () {
          const tip = d3.tip()
            .attr(`class`, `sg-tip`)
            .direction(`e`)
            .offset([-10, 0])
            .html(computeTipHtml);

          svg.call(tip);
          svg
            .selectAll(`rect`)
            .on(`mouseover`, datum => {
              if (datum.y1 - datum.y0 > 0) {
                tip.show(datum);
              }
            });

          $(parent).on(`mouseleave`, tip.hide);
        }

        function computeTipHtml ({ datum, source }) {
          const oldIndex = data.indexOf(datum) - 1;
          const stats = [
            { source, vectors: `v` },
            { source, vectors: `u`, label: false },
            { source, vectors: `vu`, label: false },
            { source, vectors: `v`, total: true },
            { source, vectors: `u`, label: source === `unverified`, total: true },
            { source, vectors: `vu`, label: false, total: true },
          ]
            .filter(isRelevantStat)
            .map(renderStat);

          return `
<div class='sg-tip-content sg-source-${source}'>
  <div class='sg-tip-date'>${ datum.dateText }</div>
  ${ stats.join(``) }
</div>`;

          function isRelevantStat ({ source, vectors, total }) {
            if (source === `unverified`) {
              if (!total) {
                return false;
              }
              return vectors === `u`;
            }
            if (!dimensions.unverified.enabled) {
              return vectors.indexOf(`u`) === -1;
            }
            return true;
          }

          function renderStat ({ source, vectors, label = true, total }) {
            const unverifiedTotal = source === `unverified` && total;
            const type = total ? `total` : source;
            const prev = oldIndex < 0 ? 0 : vectorSum(data[oldIndex][type], vectors);
            const value = vectorSum(datum[type], vectors);
            const diff = diffText(prev, value);
            const labelText = label ? getLabelText(type, unverifiedTotal) : ``;
            return `
  <div class='sg-tip-row'>
    <span class='sg-tip-label'>${ labelText }</span>
    <span class='sg-tip-vector sg-tip-vector-${ vectors }'></span>
    <span class='sg-tip-numbers'>${ value } ${ diff }</span>
  </div>`;
          }
        }
      }

      function getLabelText (type, unverifiedTotal) {
        if (unverifiedTotal) {
          return `Unverified`;
        }
        return legends[type] || type || ``;
      }

      function addPageViews (x1, x2) {
        let peak = 0;
        const pv = cloneDeep(graphData.pageviews);
        if (!pv || pv.length === 0) {
          return;
        }
        pv.forEach((cpv, i) => {
          const prevCount = i === 0 ? 0 : pv[i - 1].views;
          cpv.date = new Date(cpv.date);
          if (!wowMode) {
            cpv.views += prevCount;
          }
          if (peak < cpv.views) {
            peak = cpv.views;
          }
          if (pageviewDays) {
            const day = moment(cpv.date).day();
            const notToday = pageviewDays.indexOf(day) === -1;
            if (notToday) {
              cpv.views = prevCount;
            }
          }
        });

        const x = d3.time.scale().range([x1, x2]);
        const y = d3.scale.linear().rangeRound([height - 150, 0]);

        const line = d3.svg.line()
          .x(datum => x(datum.date))
          .y(datum => y(datum.views));

        x.domain(d3.extent(pv, datum => datum.date));
        y.domain(d3.extent(pv, datum => datum.views));

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
            .attr(`offset`, datum => datum.offset)
            .attr(`stop-color`, datum => datum.color);
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

function vectorSum (data, [ ...vectors ]) {
  return vectors.reduce((result, v) => result + data[v], 0);
}

function diffText (old, now) {
  const diff = old === 0 ? 100 : (now === 0 ? -100 : (now - old) / Math.abs(old) * 100);
  const sign = diff < 0 ? `` : `+`;
  const fixed = diff.toFixed(1).replace(/0+$/, ``).replace(/\.$/, ``);
  const css = diff < 0 ? `sg-diff-negative` : `sg-diff-positive`;
  return `<span class='sg-diff ${css}'>${ sign }${ fixed }%</span>`;
}
