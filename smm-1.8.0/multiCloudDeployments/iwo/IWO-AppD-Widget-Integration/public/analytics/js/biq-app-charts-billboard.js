
var _noPanelComponentTemplate = "#_noPanelComponent";
var _chartComponentTemplate = "#_chartComponent";
var _tableComponentTemplate = "#_tableComponent";
var _tableTemplate = "#_table";
var _timeRangeComponentTemplate = "#_timeRangeComponent";
var _boxComponentTemplate = "#_boxComponent";
var _filterComponentTemplate = "#_filtersComponent";
var _debugBiQAppCharts = false;

var generateRandomTimeData = function() {
  //For last 60 mins generate random counts
  var date = new Date();
  var results = [];
  var i = 0;
  for (i = 1; i < 61; i++) {
    results.push([date.getTime(), Math.floor(Math.random() * 1000)]);
    date.setMinutes(date.getMinutes() - 1);
  }
  return results;
};

var generateColumnData = function() {
  return [
    ["Normal", 1000],
    ["Slow", 2000],
    ["Very Slow", 3000],
    ["Error", 4000],
    ["Stall", 500]
  ];
};

var defaultColorPattern =  ['#2ca02c','#1f77b4','#ff7f0e','#d62728','#9467bd'];

var animateDiv = function(div, animate) {
  $("#" + div).addClass("animated " + animate);
};

var SI_PREFIXES = ["", "K", "M", "G", "T", "P", "E"];

function abbreviateNumber(number) {
  // what tier? (determines SI prefix)
  var tier = (Math.log10(number) / 3) | 0;

  // if zero, we don't need a prefix
  if (tier == 0) return number;

  // get prefix and determine scale
  var prefix = SI_PREFIXES[tier];
  var scale = Math.pow(10, tier * 3);

  // scale the number
  var scaled = number / scale;

  // format number and add prefix as suffix
  return scaled.toFixed(1) + prefix;
}

function debug(comp, message) {
  if (_debugBiQAppCharts) {
    try {
      console.log(comp.getDivId() + " : " + message);
    } catch (error) {
      console.log(message);
    }
  }
}

class BaseChart {
  constructor(options) {
    this.animate = true;
    this.updateDivs(options);
    this.options = options;
    var template = options.template ? options.template : _noPanelComponentTemplate;
    debug(this, "chart template : " + template);
    try{
      this.template = $.templates(template);
    }catch(error){
      //typically fails because jquery is not loaded in our unit tests
    }
  }

  setAnimation(flag) {
    this.animate = flag;
  }

  isAnimation() {
    return this.animate;
  }

  animate() {
    if (this.isAnimation()) {
      var animateOption = this.getOptions().animate;
      if (animateOption) {
        debug("animating " + this.getDivId() + " : " + animateOption);
        animateDiv(this.getDivId(), animateOption);
      }
    }
  }

  getOptions() {
    return this.options;
  }

  getChartOptions() {
    if (this.options.options) {
      return this.options.options;
    }
    if (this.options.chartOptions) {
      return this.options.chartOptions;
    }
  }

  getTypeOverride() {
    var chartOptions = this.getChartOptions();
    if (chartOptions && chartOptions.type) {
      return chartOptions.type;
    } else {
      return null;
    }
  }

  updateDivs(options) {
    if (options.targetId && !options.parentDiv && !options.div) {
      options.parentDiv = options.targetId;
      options.div = options.parentDiv + "-chart";
    }
  }

  renderOuterComponent(template) {
    if (!$("#" + this.getDivId()).length && this.options.parentDiv) {
      debug(this, "Rendering template to div : " + this.options.parentDiv);
      $("#" + this.options.parentDiv).html(template.render(this.options));
    }
  }

  setTitle(options) {
    var id = "#" + this.getDivId() + "-title";
    $(id).html(options.title);
  }

  getDiv() {
    return "#" + this.getDivId();
  }

  getDivId() {
    return this.options.div;
  }

  reset() {
    $(this.getDiv()).hide();
  }

  show() {
    $("#" + this.options.parentDiv).show();
    $(this.getDiv()).show();
  }

  updateChartOptions(chartOptions) {
    var overrideOptions = this.getChartOptions();
    if (overrideOptions) {
      for (var key in overrideOptions) {
        chartOptions[key] = overrideOptions[key];
      }
    }
  }

  renderChart(data, clickFunction) {
    //implemented by subclasses
  }

  draw(onClick, callback) {
    this.renderChart(this.options.data, onClick);
    if (callback) {
      callback(this.options);
    }
  }
}

class TimeChart extends BaseChart {
  constructor(options) {
    super(options);
  }

  isColumnData(data) {
    if (data && data[0] && data[0].length == 2) {
      return true;
    }
    return false;
  }

  isColumnGroupData(data) {
    if (data && data[0] && data[0].length == 3) {
      return true;
    }
    return false;
  }

  isRowData(data) {
    if (data && data[0] && data[0].length > 3) {
      return true;
    }
    return false;
  }

  prepColumnData(data) {
    var dates = ["dates"];
    var xLabel;
    if (super.getOptions().xLabel) {
      xLabel = super.getOptions().xLabel;
    } else {
      xLabel = "Counts";
    }
    var counts = [xLabel];
    var columnArrays = [];
    columnArrays.push(dates);
    columnArrays.push(counts);
    data.forEach(function(rec) {
      dates.push(parseInt(rec[0]));
      if(rec[1]){
        counts.push(rec[1]);
      }else{
        counts.push(0);
      }
    });
    return columnArrays;
  }

  prepColumnGroupData(data) {
    return convertToGroupData(data, false);
  }

  prepRowData(data, options) {
    //set timestamp to int
    //row data is epected to be timestamp, group, count
    data.forEach(function(rec) {
      rec[0] = parseInt(rec[0]);
    });

    var headers = ["dates"];
    headers = headers.concat(options.rowHeaders);
    data.unshift(headers);
    return data;
  }

  prepKeyAndData(options,data){
    var chartData = [];
    var key = options.dataKey;
    if (!key) {
      if (this.isColumnData(data)) {
        key = "columns";
        chartData = this.prepColumnData(data);
      } else if (this.isColumnGroupData(data)) {
        key = "columns";
        chartData = this.prepColumnGroupData(data);
      } else if (this.isRowData(data)) {
        key = "rows";
        chartData = this.prepRowData(data, options);
      } else {
        key = "columns";
        chartData = data;
      }
    } else if (key) {
      chartData = data;
    } 
    return {key:key,chartData:chartData};
  }

  renderChart(data, clickFunction) {
    var options = super.getOptions();
    super.renderOuterComponent(this.template);
    super.setTitle(options);
    var keyAndData = this.prepKeyAndData(options,data);
    this.renderGraph(keyAndData.key, keyAndData.chartData, clickFunction);
    super.show();
    super.animate();
  }

  renderGraph(dataKey, data, clickFunction) {
    var type = "line";
    if (this.getTypeOverride()) {
      type = this.getTypeOverride();
    }

    var chartOptions = {
      bindto: super.getDiv(),
      data: {
        x: "dates",
        type: type,
        onclick: function(e) {
          var date = new Date(e.x.getTime());
          if (clickFunction) {
            clickFunction({ id: e.id, date: date });
          }
        }
      },
      axis: {
        x: {
          type: "timeseries",
          tick: {
            format: "%m-%d %H:%M %p",
            fit: false,
            rotate: 45
          }
        }
      }
    };
    chartOptions.data[dataKey] = data;
    super.updateChartOptions(chartOptions);
    debug(this, JSON.stringify(chartOptions));
    this.chart = bb.generate(chartOptions);
  }
}

class SparkLineChart extends TimeChart {
  constructor(options) {
    super(options);
  }

  renderGraph(dataKey, data, clickFunction) {
    var options = super.getOptions();
    var type = "area-spline";
    if (this.getTypeOverride()) {
      type = this.getTypeOverride();
    }
    var chartOptions = {
      bindto: super.getDiv(),
      data: {
        x: "dates",
        type: type,
        onclick: function(e) {
          var date = new Date(e.x.getTime());
          if (clickFunction) {
            clickFunction({ id: e.id, date: date });
          }
        }
      },
      legend: { show: false },
      tooltip: { show: false },
      axis: {
        x: { show: false },
        y: { show: false }
      },
      point: {
        show: false
      }
    };
    chartOptions.data[dataKey] = data;
    super.updateChartOptions(chartOptions);
    this.chart = bb.generate(chartOptions);
  }
}

class DonutChart extends BaseChart {
  constructor(options) {
    super(options);
  }

  renderChart(data, clickFunction) {
    super.renderOuterComponent(this.template);
    var chartOptions = {
      bindto: super.getDiv(),
      data: {
        columns: data,
        type: "donut",
        onclick: function(d, i) {
          if (clickFunction) {
            debug(this, JSON.stringify(d));
            clickFunction(d);
          }
        }
      },
      legend: { show: true },
      donut: {
        title: this.options.title
      }
    };

    super.updateChartOptions(chartOptions);
    debug(this, JSON.stringify(chartOptions));
    this.chart = bb.generate(chartOptions);
    super.show();
    super.animate();
  }
}

class PieChart extends BaseChart {
  constructor(options) {
    super(options);
  }

  renderChart(data, clickFunction) {
    super.renderOuterComponent(this.template);
    super.setTitle(super.getOptions());
    var chartOptions = {
      bindto: super.getDiv(),
      data: {
        columns: data,
        type: "pie",
        onclick: function(d, i) {
          if (clickFunction) {
            debug(this, JSON.stringify(d));
            clickFunction(d);
          }
        }
      },
      legend: { show: true }
    };

    super.updateChartOptions(chartOptions);
    if(!chartOptions.color){
      chartOptions.color = {pattern: defaultColorPattern};
    }
    this.chart = bb.generate(chartOptions);
    super.show();
    super.animate();
  }
}

class GaugeChart extends BaseChart {
  constructor(options) {
    super(options);
  }

  renderChart(data, clickFunction) {
    super.renderOuterComponent(this.template);

    var chartOptions = {
      bindto: super.getDiv(),
      data: {
        columns: data,
        type: "gauge",
        onclick: function(d, i) {
          if (clickFunction) {
            debug(this, JSON.stringify(d));
            clickFunction(d);
          }
        }
      },
      legend: { show: true }
    };

    super.updateChartOptions(chartOptions);
    this.chart = bb.generate(chartOptions);
    super.show();
    super.animate();
  }
}

class Table extends BaseChart {
  constructor(options) {
    if (!options.template) {
      options.template = _tableTemplate;
    }
    super(options);
    this.order = options.order;
    if (!this.order) {
      this.order = [[options.columns.length - 1, "desc"]];
    }
  }

  renderChart(data, clickFunction) {
    super.renderOuterComponent(this.template);
    super.setTitle(super.getOptions());
    var id = this.getDiv();
    var table = $(id);

    if (!$.fn.DataTable.isDataTable(id)) {
      var initOptions = super.getOptions().options;
      if (!initOptions) {
        initOptions = {};
      } else {
        initOptions = jQuery.extend({}, initOptions);
      }
      initOptions.data = data;
      initOptions.columns = super.getOptions().columns;
      initOptions.order = this.order;

      table.DataTable(initOptions);
      table.DataTable().on("click", 'tr[role="row"]', function() {
        table
          .DataTable()
          .$("tr.selected")
          .removeClass("selected");
        var tr = $(this);
        tr.toggleClass("selected");
        var row = table.DataTable().row(tr);
        if (clickFunction) {
          clickFunction(row.data());
        }
      });
    } else {
      table.DataTable().clear();
      table.DataTable().rows.add(data);
      table.DataTable().draw();
    }

    if (super.getOptions().class) {
      $(id).addClass(super.getOptions().class);
    }
    super.show();
    super.animate();
  }
}

var biqUpdateQuery = function(options,query,filters) {
  if (options.ignoreFilters) {
    return query;
  } else {
    if (filters && filters.length > 0) {
      var orderByPos = query.toLowerCase().indexOf("order by");
      var preQuery,postQuery = "";
      
      if (orderByPos > 0) {
        preQuery = query.substring(0, orderByPos);
        postQuery = query.substring(orderByPos, query.length);
      } else {
        preQuery = query;
      }
      var hasWhere = false;
      if(preQuery.toLowerCase().indexOf("where") > 0){
        hasWhere = true;
      }

      if(!hasWhere){
        preQuery += " WHERE ";
      }

      for (let index = 0; index < filters.length; index++) {
        const filter = filters[index];
        if(!hasWhere && index==0){
          preQuery += filter.field + " = '" + filter.value + "'";
        }else{
          preQuery += " AND " + filter.field + " = '" + filter.value + "'";
        }
      }

      if(postQuery.length > 1){
        return preQuery + " " + postQuery;
      }else{
        return preQuery;
      }
    } else {
      return query;
    }
  }
}

class BaseComponent {
  constructor(options, chart) {
    this.options = options;
    this.chart = chart;
    addComponent(this);
    if (this.options.preProcessFn) {
      this.preProcess = this.options.preProcessFn;
    }
    if (this.options.preRenderFn) {
      this.preRender = this.options.preRenderFn;
    }
    if (this.options.postRenderFn) {
      this.postRender = this.options.postRenderFn;
    }
    if (!options.template) {
      options.template = _chartComponentTemplate;
    }
    if (this.chart) {
      this.chart.setAnimation(false);
    }
  }

  getOptions() {
    return this.options;
  }

  resetChildren(children) {
    if (children) {
      children.forEach(function(child) {
        $("#" + child).hide();
      });
    }
  }

  getChart() {
    return this.chart;
  }

  _updateQuery(options, query) {
    return biqUpdateQuery(options,query,_biqFilters);
  }

  draw(onClick, callback) {
    var options = this.getOptions();
    var chart = this.getChart();
    this._draw(
      options,
      chart,
      this.resetChildren,
      this.preProcess,
      onClick,
      this._render,
      this.preRender,
      this.postRender,
      callback
    );
  }

  _draw(
    options,
    chart,
    resetChildrenFunction,
    preProcess,
    onClick,
    _render,
    preRender,
    postRender,
    callback
  ) {
    if (options.query) {
      var queryOptions = options.query;
      if (typeof queryOptions == "string") {
        queryOptions = { query: this._updateQuery(options, options.query) };
      } else {
        queryOptions.query = this._updateQuery(options, queryOptions.query);
      }
      search(queryOptions, function(data) {
        _render(
          chart,
          options,
          onClick,
          resetChildrenFunction,
          preProcess,
          data,
          preRender,
          postRender,
          callback
        );
      });
    } else {
      var data;
      if (options.data == true || !options.data) {
        data = this.generateRandomData();
      } else {
        data = options.data;
      }
      if (!data) {
        data = [];
      }
      _render(
        chart,
        options,
        onClick,
        resetChildrenFunction,
        preProcess,
        data,
        preRender,
        postRender,
        callback
      );
    }
  }

  generateRandomData() {
    return generateRandomTimeData();
  }

  _render(
    chart,
    options,
    onClick,
    resetChildrenFunction,
    preProcess,
    data,
    preRender,
    postRender,
    callback
  ) {
    if (preProcess) {
      data = preProcess(options, data);
    }
    if (preRender) {
      preRender(chart, options, data);
    }
    chart.renderChart(data, function(result) {
      resetChildrenFunction(options.reset);
      if (onClick) {
        onClick(result);
      }
    });
    if (postRender) {
      postRender(chart, options, data);
    }
    if (options.animate) {
      animateDiv(options.targetId, options.animate);
    }
    if (callback) {
      callback(options, data);
    }
  }
}

class TableComponent extends BaseComponent {
  constructor(options) {
    if (!options.template) {
      options.template = _tableComponentTemplate;
    }
    super(options, new Table(options));
  }

  generateRandomData() {
    return generateColumnData();
  }
}

class TimeChartComponent extends BaseComponent {
  constructor(options) {
    if (!options.template) {
      options.template = _chartComponentTemplate;
    }
    super(options, new TimeChart(options));
  }
}

class TimeRangeComponent extends BaseComponent {
  constructor(options) {
    options.template = _timeRangeComponentTemplate;
    super(options);
  }

  draw(onClick, callback) {
    var options = this.getOptions();
    this.template = $.templates(options.template);
    $("#" + options.targetId).html(this.template.render(options));
    $("#timeRange").on("change", function() {
      if (onClick) {
        onClick({
          timebucket: getTimeBucket(),
          text: getTimeRangeText(),
          start: getTimeRange().start,
          end: getTimeRange().end
        });
      }
    });
    if (callback) {
      callback(options);
    }
  }
}

box_setAbbreviation = function(options,value){
    value = roundValue(value);
    if(!options.hasOwnProperty('abbreviate')){
        options.value = abbreviateNumber(value);
    }else if(options.abbreviate){
        options.value = abbreviateNumber(value);
    }else{
        options.value = value;
    }
}

box_getTotal = function(options,data) {
    try {
      var total = 0;
      data.forEach(function(rec) {
        total += rec[1];
      });
      box_setAbbreviation(options,total);
    } catch (error) {
      console.log(error);
    }
}

box_getMax = function(options,data) {
    try {
      var max = 0;
      data.forEach(function(rec) {
        if(rec[1] > max){
            max = rec[1];
        }
      });
      box_setAbbreviation(options,max);
    } catch (error) {
      console.log(error);
    }
}

box_getAvg = function(options,data) {
    try {
        var total = 0;
        data.forEach(function(rec) {
            total += rec[1];
        });
        var avg = 0;
        if(total>0){
            avg = total/data.length;
        }
        box_setAbbreviation(options,avg);
    } catch (error) {
        console.log(error);
    }
}

class BoxChartComponent extends BaseComponent {
  constructor(options) {
    options.div = options.targetId + "-chart";
    options.hasChart = true;
    super(options, new SparkLineChart(options));
  }

  preProcess(options, data) {

    if (!options.value) {
        if(!options.rollup){
            box_getTotal(options, data);
        }else if(options.rollup == 'max'){
            box_getMax(options, data);
        }else if(options.rollup == 'avg'){
            box_getAvg(options, data);
        }else{
            box_getTotal(options, data);
        }
    }
    return data;
  }

  preRender(chart, options, data) {
    $("#" + options.targetId).html(
      $.templates(_boxComponentTemplate).render(options)
    );
  }
}

class BoxComponent extends BaseComponent {
  constructor(options) {
    if (!options.action) {
      options.action = options.title;
    }
    options.hasChart = false;
    super(options, null);
  }

  draw(onClick, callback) {
    var options = super.getOptions();
    $("#" + options.targetId).html(
      $.templates(_boxComponentTemplate).render(options)
    );
    if (options.animate) {
      animateDiv(options.targetId, options.animate);
    }
  }
}

class FilterComponent extends BaseComponent {
  constructor(options) {
    options.template = _filterComponentTemplate;
    super(options);
  }

  draw(onClick, callback) {
    var options = this.getOptions();
    this.template = $.templates(options.template);
    $("#" + options.targetId).html(this.template.render(options));
    options.filters.forEach(function(filter) {
      if (filter.query) {
        autoCompleteOnFilter(
          "#" + filter.id,
          filter.query,
          filter.adqlField,
          function(selection) {}
        );
      }
    });

    $("#_submitFilter").on("click", function() {
      var results = [];
      options.filters.forEach(function(filter) {
        var value = $("#" + filter.id).val();
        if (value && value.length > 0) {
          results.push({ field: filter.adqlField, value: value });
        }
      });
      _biqFilters = results;
      if (onClick) {
        onClick(_biqFilters);
      }
    });
    $("#_resetFilter").on("click", function() {
      options.filters.forEach(function(filter) {
        $("#" + filter.id).val("");
      });
      _biqFilters = [];
    });
    if (callback) {
      callback(options);
    }
    new TimeRangeComponent({
      targetId: "_timeSelector"
    }).draw();
  }

  updateQuery(query) {
    return updateQueryWithFilters(query);
  }
}

var hideElements = function(elems) {
  if (elems) {
    elems.forEach(function(elem) {
      $("#" + elem).hide();
    });
  }
};

var showElements = function (elems){
  if(elems){
      elems.forEach(function(elem){
          $("#"+elem).show();
      });
  }
}

var _biqComponents = [];
var addComponent = function(comp) {
  //_biqComponents.push(comp); //For now do not add to this array list. This was meant to be a way of children auto listening to parent changes. But never got implemented.
  return comp;
};

var _biqFilters = [];

var updateQueryWithFilters = function(query) {
  if (_biqFilters && _biqFilters.length > 0) {
    _biqFilters.forEach(function(filter) {
      var noSpaceQuery = query.replace(/\s/g, "");
      if (!noSpaceQuery.includes(filter.field + "=")) {
        query += " AND " + filter.field + " = '" + filter.value + "'";
      }
    });
  }
  return query;
};

class PieChartComponent extends BaseComponent {
  constructor(options) {
    options.template = _chartComponentTemplate;
    super(options, new PieChart(options));
  }

  generateRandomData() {
    return generateColumnData();
  }
}

class DonutChartComponent extends BaseComponent {
  constructor(options) {
    if (!options.template) {
      options.template = _chartComponentTemplate;
    }
    super(options, new DonutChart(options));
  }

  generateRandomData() {
    return generateColumnData();
  }
}



class SankeyChart extends BaseChart {
  constructor(options) {
    options.div = options.targetId;
    super(options);
  }

  generateSampleData() {
    return  {
      nodes: [{ "id": 0, "name": "RuntimeException" },
      { "id": 1, "name": "Login Service" },
      { "id": 2, "name": "DB Service" },
      { "id": 3, "name": "Customer A" },
      { "id": 4, "name": "Customer B" }],
      links: [{ "source": 0, "target": 1, "value": 15 },
      { "source": 0, "target": 2, "value": 5 },
      { "source": 1, "target": 3, "value": 10 },
      { "source": 1, "target": 4 , "value": 5 }
      ]
    };
  }

  renderChart(onClick) {
    var sankeyId = "#" + super.getDivId();
    var data = this.getOptions().data;
    if (!data) {
      data = this.generateSampleData();
    }
    var options = this.getOptions();
    const width = options.width ||  964;
    const height = options.height || 600;
    //input/output/path
    let edgeColor =  options.pathColor || 'input';
    
    const _sankey = d3.sankey()
          .nodeWidth(15)
          .nodePadding(10)
          .extent([[1, 1], [width - 1, height - 5]]);
      const sankey = ({nodes, links}) => _sankey({
        nodes: nodes.map(d => Object.assign({}, d)),
        links: links.map(d => Object.assign({}, d))
      });
    
    
      const f = d3.format(",.0f");
      const format = d => `${f(d)} TWh`;
    
      const _color = d3.scaleOrdinal(d3.schemeCategory10);
      const color = name => _color(name.replace(/ .*/, ""));
    
    const svg = d3.select(sankeyId)
          .attr("viewBox", `0 0 ${width} ${height}`)
          .style("width", width)
          .style("height", height);
    
    const {nodes, links} = sankey(data);
    
      svg.append("g")
          .attr("stroke", "#000")
        .selectAll("rect")
        .data(nodes)
        .join("rect")
        .on("click",function(d){
          if (d3.event.defaultPrevented) return;
          if(onClick) { onClick(d); }
      })
          .attr("x", d => d.x0)
          .attr("y", d => d.y0)
          .attr("height", d => d.y1 - d.y0)
          .attr("width", d => d.x1 - d.x0)
          .attr("fill", d => color(d.name))
          .attr("class", "sankeyNode")
        .append("title")
          .text(d => `${d.name}\n${format(d.value)}`)
          ;
    
      const link = svg.append("g")
          .attr("fill", "none")
          .attr("stroke-opacity", 0.5)
        .selectAll("g")
        .data(links)
        .join("g")
          .style("mix-blend-mode", "multiply");
          

    
    function update() {
      if (edgeColor === "path") {
        const gradient = link.append("linearGradient")
            .attr("id", (d,i) => {
            //  (d.uid = DOM.uid("link")).id
            const id = `link-${i}`;
            d.uid = `url(#${id})`;
            return id;
            })
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", d => d.source.x1)
            .attr("x2", d => d.target.x0);
    
        gradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", d => color(d.source.name));
    
        gradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", d => color(d.target.name));
      }
    
      link.append("path")
          .attr("d", d3.sankeyLinkHorizontal())
          .attr("stroke", d => edgeColor === "path" ? d.uid
              : edgeColor === "input" ? color(d.source.name)
              : color(d.target.name))
          .attr("stroke-width", d => Math.max(1, d.width))
          .attr("class", "sankeyLink");
          }
          
          update();
    
      link.append("title")
          .text(d => `${d.source.name} → ${d.target.name}\n${format(d.value)}`);
    
      svg.append("g")

          .style("font", "10px sans-serif")
        .selectAll("text")
        .data(nodes)
        .join("text")
          .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
          .attr("y", d => (d.y1 + d.y0) / 2)
          .attr("dy", "0.35em")
          .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
          .text(d => d.name);
          d3.selectAll('.sankeyLink').on('mouseover', function(){
            d3.select(this).style("stroke-opacity", ".5"); })
          }

}

class TimeLineChart extends BaseChart {
  constructor(options) {
    options.div = options.targetId;
    super(options);
  }

  getRandomData(ordinal = false) {
    const NGROUPS = 6,
    MAXLINES = 15,
    MAXSEGMENTS = 20,
    MAXCATEGORIES = 20,
    MINTIME = new Date(2013,2,21);
  
    const nCategories = Math.ceil(Math.random()*MAXCATEGORIES),
    categoryLabels = ['Normal','Slow','Very Slow','Stall','Error'];
    const groupLabels = ["Aero","E-Aero","UROC","SmartScan","CSL","CSL-Aero"];
  
    return [...Array(NGROUPS).keys()].map(i => ({
    group: groupLabels[i],
    data: getGroupData()
    }));
  
    function getGroupData() {

      return [...Array(Math.ceil(Math.random()*MAXLINES)).keys()].map(i => ({
        label: 'label' + (i+1),
        data: getSegmentsData()
      }));
  
      function getSegmentsData() {
        const nSegments = Math.ceil(Math.random()*MAXSEGMENTS),
        segMaxLength = Math.round(((new Date())-MINTIME)/nSegments);
        let runLength = MINTIME;
  
        return [...Array(nSegments).keys()].map(i => {
        const tDivide = [Math.random(), Math.random()].sort(),
          start = new Date(runLength.getTime() + tDivide[0]*segMaxLength),
          end = new Date(runLength.getTime() + tDivide[1]*segMaxLength);
  
        runLength = new Date(runLength.getTime() + segMaxLength);
  
        return {
          timeRange: [start, end],
          val: ordinal ? categoryLabels[Math.ceil(Math.random()*nCategories)] : Math.random()
          //labelVal: is optional - only displayed in the labels
        };
        });
  
      }
    }
  }

  generateSampleData() {
    return this.getRandomData(true);
  }

  renderChart(onClick) {
    var id = super.getDivId();
    var data = this.getOptions().data;
    if (!data) {
      data = this.generateSampleData();
    }
    
    var chartOptions = super.getChartOptions();

    TimelinesChart()(document.getElementById(id))
		.maxHeight(chartOptions.height)
		.width(chartOptions.width)
		.zScaleLabel(chartOptions.scaleLabel)
		.zQualitative(true)
		.dateMarker(new Date() - 365 * 24 * 60 * 60 * 1000) // Add a marker 1y ago
		.data(data);
  }
}


try{
  if(exports){
      exports.TimeChart  = TimeChart;
      var convertToGroupData = function(data,flag){
        return data;
      };
      exports.biqUpdateQuery = biqUpdateQuery;
  }
}catch(error){
 // console.log(error);
}
