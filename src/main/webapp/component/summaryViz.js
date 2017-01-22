define(
  [
     'component/base',
     'd3',
     'moment',
     'mixin/withVizPrep',
     'mixin/withYADAUtils'
  ],
  function(base,d3,moment,withVizPrep,withYADAUtils)
  {
    'use strict';
    return base.mixin(SummaryViz,withVizPrep,withYADAUtils);
    function SummaryViz()
    {
      /* Vitals
      Statistic	Round Trip	Inbound	Outbound
      Current Expense (Savings)	$ -617.1
      Same Day Round Trip Count	402
      Total Trip Count	424	426	424
      Median Runtime	02:05	00:59:13	01:05:50
      Mean Velocity	15.72
      Median Elapsed Time	02:15	01:03:40	01:11:32
      Mean Effective Velocity	14.43
      Fastest Run Time		00:51:04	00:53:36
      Fastest Runtime Date		2013-11-01	2012-09-27
      Fastest Elapsed Time		00:54:25	00:56:14
      Fastest Elapsed Time Date		2014-04-14	2012-09-27
      */
      var that, tabs, $tab, r = {}, width=400, height=300;
      var conf = window.yadademo.content;
      var cycGasPrepExecuted = false,
          cycExpensesVizExecuted = false,
          cycSleepVizExecuted = false,
          cycWindVizExecuted = false,
          cycTempVizExecuted = false;
      //r.parseTime   = d3.timeParse(opt.timeParseFormat);
      //r.titleOffset = 15;

      this.executeVizFunction = function(fn,data) {
        var id = fn.replace('Viz','').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
        var attrs = {
          'id': id, // hyphenated function name used by vizPrep
          'svgid':id+'-viz',
          'fn': this[fn], // the actual function
          'tab':'summary',
          'data':data
        };
        var tmplvars = {
          'id':id, // hyphenated function name used by render function
          'width':width,
          'height':height
        };
        var renderPayload = {
          'template':'viz',
          'selector':'#'+id+'-viz-box',
          'parent':this.select('view'),
          'attrs':attrs,
          'tmplvars':tmplvars,
          'event':'request.viz',
          'target':'#'+id+'-viz-box'
        };
        this.trigger('request.renderer',renderPayload);
      };







      this.execAll = function(e,d) {
        // this 'summaryViz' component might load late,
        // so this function runs through all the subroutines
        // which won't execute ever if the events that
        // trigger them fired early, i.e., before 'initialize'
        this.cycViz();
        this.gasViz();
        this.sleepViz();
        //this.weatherViz();
        this.expensesViz();
      };

      this.cycViz = function(e,d) {
        if(!!!tabs.cyc.loaded)
          return;

        // Prep
        this.cycGasPrep();
        // Elapsed Time Cycling vs Driving
        //this.cycSleepViz();
        // if(!cycWindVizExecuted)
        //   this.executeVizFunction("cycWindViz");
        // if(!cycTempVizExecuted)
        //   this.executeVizFunction("cycTempViz");
      };

      this.gasViz = function(e,d) {
        if(!!!tabs.gas.loaded)
          return;
        this.buildGasMap();
        this.cycGasPrep();
      };

      this.expensesViz = function(e,d) {
        if(!!!tabs.expenses.loaded)
          return;
        // Current Savings
        this.cycGasPrep();
      };

      this.sleepViz = function(e,d) {
        if(!!!tabs.sleep.loaded)
          return;
        this.cycSleepViz();
      };

      this.weatherViz = function(e,d) {
        if(!!!tabs.weather.loaded)
          return;
        if(!cycWindVizExecuted)
          this.executeVizFunction("cycWindViz");
        if(!cycTempVizExecuted)
          this.executeVizFunction("cycTempViz");
      };

      



      this.cycSleepViz = function() {
        if(!!!tabs.cyc.loaded || !!!tabs.sleep.loaded)
          return;
        // Perf by Sleep

      }

      this.cycWindViz = function(d) {
        if(!!!tabs.cyc.loaded || !!!tabs.weather.loaded)
          return;
        // Perf by Wind
        if(!cycWindVizExecuted)
        {
          cycWindVizExecuted = true;
          var p = this.vizPrep({
            "svgId":d.svgid,
            "tab": d.tab,
            "timeParseFormat": "%Y-%m-%d %H:%M:%S",
            "title": "Velocity vs Wind Speed",
            "yLabel": "Wind (MPH)",
            "xLabel": "Velocity (MPH)",
            "citation": ""
          });

          p.data = _.filter(tabs.weather.data,function(o) { return o.windspd < 100 && o.velocity < 50; });
          // domains
          var xDom = _.map(p.data,function(o){return parseFloat(o.velocity);});
          var yDom = _.map(p.data,function(o){return parseFloat(o.windspd);});

          // scales
          p.scaleX = function(min,max) {
            return d3.scaleLinear()
              .rangeRound([0, p.width-10])
              .domain([min,max]);
          };
          var x = p.scaleX(d3.min(xDom)-2,d3.max(xDom)+2);
          var y = p.scaleY(0,d3.max(yDom)+2);

          // axes
          p.xAxis(x);
          p.yAxis(y);

          // data
          p.svg.data(p.data);

          // dots
          var wind = p.g.append("g");
          wind.selectAll('.dot')
              .data(p.data)
              .enter()
              .append("circle")
              .attr('class','dot')
              .attr("r", 2)
              .attr("cx", function(d) {return x(parseFloat(d.velocity));})
              .attr("cy", function(d) {return y(parseFloat(d.windspd));})
              .style("fill", function(d) { return "#f77300";})
        }
      }

      this.cycTempViz = function(d) {
        if(!!!tabs.cyc.loaded || !!!tabs.weather.loaded)
          return;
        // Perf by Temp
        if(!cycTempVizExecuted)
        {
          cycTempVizExecuted = true;
          var p = this.vizPrep({
            "svgId":d.svgid,
            "tab": d.tab,
            "timeParseFormat": "%Y-%m-%d %H:%M:%S",
            "title": "Velocity vs Temperature",
            "yLabel": "Temp (Cº)",
            "xLabel": "Velocity (MPH)",
            "citation": ""
          });

          p.data = _.filter(tabs.weather.data,function(o) { return o.windspd < 100 && o.velocity < 50; });
          // domains
          var xDom = _.map(p.data,function(o){return parseFloat(o.velocity);});
          var yDom = _.map(p.data,function(o){return parseFloat(o.temp);});

          // scales
          p.scaleX = function(min,max) {
            return d3.scaleLinear()
              .rangeRound([0, p.width-10])
              .domain([min,max]);
          };
          var x = p.scaleX(d3.min(xDom)-2,d3.max(xDom)+2);
          var y = p.scaleY(d3.min(yDom)-2,d3.max(yDom)+2);

          // axes
          p.xAxis(x);
          p.yAxis(y);

          // data
          p.svg.data(p.data);

          // dots
          var wind = p.g.append("g");
          wind.selectAll('.dot')
              .data(p.data)
              .enter()
              .append("circle")
              .attr('class','dot')
              .attr("r", 2)
              .attr("cx", function(d) {return x(parseFloat(d.velocity));})
              .attr("cy", function(d) {return y(parseFloat(d.temp));})
              .style("fill", function(d) { return "#f77300";})
        }
      }

      this.defaultAttrs({
        'q_cyc_rt': 'CYC select round trips',
        'view': '#summary-detail-panel .look-tab'
      });

      this.after('initialize', function() {
        tabs = window.yadademo.content.tabs;
        this.executeVizFunction('cycVsDriveViz');
        this.on('cyc.viz',this.cycViz);
        this.on('gas.viz',this.gasViz);
        this.on('expenses.viz',this.expensesViz);
        this.on('sleep.viz',this.sleepViz);
        this.on('weather.viz',this.weatherViz);
        this.execAll();
        this.enrich();
      });

      /**
       * bootstrap rich ui
       */
      this.enrich = function() {
        $('#summary-detail-panel li:eq(1)').hide();
      };

    }
  }
);
