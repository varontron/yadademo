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

      this.costPerDay = function(event) {
        var scenarios             = [],
            MAX_DAYS_PER_WK_WAH   = conf.variables.parking['wah-days'],
            MIN_DAYS_PER_WEEK_PKG = 2,
            MAX_DAYS_PER_WEEK_PKG = conf.variables.parking['max-io-days'],
            PARKING_PER_DAY       = [4,6,8,13,14,15,16,17,18,19,20],
            WEEKS_PER_YR          = conf.constants['weeks-per-year'],
            YrDays                = conf.constants['days-per-year']
                                    - conf.constants['weekends-per-year']
                                    - conf.variables.pto['paid-holiday']
                                    - conf.variables.pto['vacation-day']
                                    - conf.variables.pto['personal-day'],
            year                  = event.getFullYear(),
            month                 = event.getMonth()+1,
            gasMap                = this.gasMap,
            car                   = _.filter(conf.vehicles,function(n) {
              return new Date(n.start.slice(0,7)+"-01 00:00:00") <= event
                && (new Date(n.end.slice(0,7)+"-01 00:00:00") >= event || n.end == "");
            })[0],
            maintPerYr            = car.maintenance,
            gymPerYr              = conf.variables.savings['gym-membership'],
            insPerYr              = conf.variables.savings['life-ins-prem'];

        month                     = month < 10 ? "0"+month : month;

        var dollarsPerGallon      = gasMap[year.toString()+month.toString()];
        // adjust for current month (which won't be in gasMap)
        if(!!!dollarsPerGallon)
        {
          dollarsPerGallon = parseFloat(gasMap[_.max(_.keys(gasMap))]);
        }


        // work at home
        for(let i=0;i<=MAX_DAYS_PER_WK_WAH;i++)
        {
          let daysPerYr   = YrDays - (WEEKS_PER_YR * (i/2));
          let milesPerYr  = daysPerYr * conf.variables.miscellaneous['rt-miles'];
          let gasPerYr    = (milesPerYr/car.mpg)*dollarsPerGallon;
          let healthPerYr = conf.variables.savings['health-savings']*daysPerYr;
          // parking subsidy on/off
          for(let m=0;m<=1;m++)
          {
            let pkgSubsidy   = conf.variables.parking['monthly-pkg-subsidy']*m;
            let pkgSubPerYr  = pkgSubsidy * conf.constants['months-per-year'];
            let minDaysPerWeekPkg = MIN_DAYS_PER_WEEK_PKG;
            let parkingPerDay     = PARKING_PER_DAY;
            if(pkgSubsidy > 0)
            {
              minDaysPerWeekPkg = MAX_DAYS_PER_WEEK_PKG; // no free parking (pay by month)
              parkingPerDay = PARKING_PER_DAY.slice(5);  // no cheap or short-term parking (meters)
            }
            // free parking only in non-subsidy scenarios
            for(let pkgDaysWk=minDaysPerWeekPkg;pkgDaysWk<=MAX_DAYS_PER_WEEK_PKG;pkgDaysWk++)
            {
              // parking per day
              let idx=0;
              for(let pkgPerDay=_.min(parkingPerDay);pkgPerDay<=_.max(parkingPerDay);pkgPerDay=parkingPerDay[idx++])
              {
                let pkgCostYr    = pkgDaysWk * pkgPerDay * WEEKS_PER_YR;
                let pkgCostPerYr = pkgSubPerYr > pkgCostYr ? 0 : pkgCostYr - pkgSubPerYr;
                let costPerYr    = pkgCostPerYr + gasPerYr + maintPerYr + healthPerYr + gymPerYr + insPerYr;
                scenarios.push(costPerYr/YrDays);
              }
            }
          }
        }
        return scenarios;
      };

      this.buildGasMap = function() {
        var that = this;
        if(!!!this.gasMap)
        {
          this.gasMap = {};
          // build a hash of gas prices by month
          _.each(conf.tabs['gas'].data,function(n) {
            that.gasMap[n.year+n.period.slice(1)] = n.value;
          });
        }
      };

      this.cycGasPrep = function() {
        var that = this;

        setTimeout(function() {
            // only run if both data sets have loaded
            if(!!!tabs.cyc.loaded || !!!tabs.gas.loaded)
              return;
            else
            {
              if(!cycGasPrepExecuted)
              {
                cycGasPrepExecuted = true;
                that.costData = [];
                that.costMap  = {};
                that.buildGasMap();
                var minDate = moment(tabs.cyc.data[0].startDate);//moment(_.min(_.map(tabs.cyc.data,"startTime")));
                var maxDate = moment();
                var months  = [];
                while (maxDate > minDate) {
                   months.push(minDate.format('YYYYMM'));
                   minDate.add(1,'month');
                };
                _.each(months, function(o) {
                  let d         = new Date(o.slice(0,4),parseInt(o.slice(4))-1,1)
                  let scenarios = that.costPerDay(d);
                  let meanCost  = _.reduce(scenarios,function(sum,n) { return sum+n})/scenarios.length;
                  that.costData.push({"date":moment(d).format("YYYY-MM-DD"),"cost":meanCost});
                  that.costMap[o.toString()] = meanCost;
                });
                // Daily Driving Cost
                that.executeVizFunction('costPerDayViz',that.costData);

                // Current Savings
                that.executeVizFunction('cycExpensesViz',that.costMap);
              }
            }
        },100);
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

      this.cycVsDriveViz = function(d) {
        // Elapsed Time Cycling vs Driving
        var that = this;
        var a = $.ajax({
          data:{ //http://localhost:8888/yada.jsp?q=CYC select round trips&pl=ScriptPostprocessor,time_pdf.py&pz=-1&c=false"
            "q":"CYC select round trips",
            "pl":"ScriptPostprocessor,time_pdf.py"
          }
        });
        var aReject = function(e) {
          alert("Problem with detail data query:" + e);
        };
        var aResolve = function(r) {
          var cyc=r.KDE_cyc,
              drv=r.KDE_drive;

          var p = that.vizPrep({
            "svgId":d.svgid,
            "tab": d.tab,
            "timeParseFormat": "%Y-%m-%d",
            "title": "Round Trip Elapsed Time: Cycling Vs Driving",
            "yLabel": "Probability",
            "xLabel": "Minutes",
            "citation": "See other tabs for source information."
          });

          // domains
          var xDomCyc = _.map(cyc,function(o){return o.x;})
          var xDomDrv = _.map(drv,function(o){return o.x;})
          var yDomCyc = _.map(cyc,function(o){return o.y;})
          var yDomDrv = _.map(drv,function(o){return parseFloat(o.y);})

          // scales
          p.scaleX = function(min,max) {
            return d3.scaleLinear()
              .rangeRound([0, p.width-10])
              .domain([min,max]);
          };
          var x = p.scaleX(d3.min(xDomDrv)-10,d3.max(xDomCyc)+10);
          var y = p.scaleY(0,d3.max(yDomCyc)+.01);

          // axes
          p.xAxis(x);
          p.yAxis(y);
          // line
          var line = d3.line()
              .x(function(d) { return x(d.x);})
              .y(function(d) { return y(d.y);});
          // viz
          p.g.append("path")
            .datum(cyc) // cycling
            .attr("d",line)
            .style("fill","#f77300")
            .style("opacity","0.7")
            .style("stroke","#f77300")
            .style("stroke-width","1px");
          p.g.append("path")
            .datum(drv) // driving
            .attr("d",line)
            .style("fill","#994700")
            .style("opacity","0.7")
            .style("stroke","#994700")
            .style("stroke-width","1px");
          p.g.append("path")
            .datum(cyc) // cycling
            .attr("d",line)
            .style("fill","none")
            .style("stroke","#f77300")
            .style("stroke-width","2px");
          p.g.append("path")
            .datum(drv) // driving
            .attr("d",line)
            .style("fill","none")
            .style("stroke","#994700")
            .style("stroke-width","2px");

          // ---------------------------
          // Cyc Medians
          var bisect = d3.bisector(function(d) { return d.x; }).left;
          var item   = cyc[bisect(cyc,r.med_cyc)];
          var y2     = y(item.y);
          p.g.append("line")
            .attr("x1",x(r.med_cyc))
            .attr("y1",p.height)
            .attr("x2",x(r.med_cyc))
            .attr("y2",y2)
            .attr("stroke-dasharray","10,5")
            .style("fill","none")
            .style("stroke","#f77300")
            .style("stroke-width","2px");
            var item   = cyc[bisect(cyc,r.med_cyc)];
            var y2     = y(item.y);
          item = drv[bisect(drv,r.med_drive)];
          y2   = y(item.y);
          p.g.append("line")
            .attr("x1",x(r.med_drive))
            .attr("y1",p.height)
            .attr("x2",x(r.med_drive))
            .attr("y2",y2)
            .attr("stroke-dasharray","10,5")
            .style("fill","none")
            .style("stroke","#994700")
            .style("stroke-width","2px");
          // End Cyc Medians
          // ---------------------------

          // ---------------------------
          // Cyc Median Callouts
          p.g.append("line")
            .attr("x1",x(r.med_cyc))
            .attr("y1",y(0.0175))
            .attr("x2",x(r.med_cyc+30))
            .attr("y2",y(0.0175))
            .style("fill","none")
            .style("stroke","#f77300")
            .style("stroke-width","1px");
          p.g.append("line")
            .attr("x1",x(r.med_drive))
            .attr("y1",y(0.0175))
            .attr("x2",x(r.med_drive-30))
            .attr("y2",y(0.0175))
            .style("fill","none")
            .style("stroke","#994700")
            .style("stroke-width","1px");
          p.g.append("rect")
            .attr("transform","translate("+x(r.med_cyc+30)+","+y(0.0195)+")")
            .attr("width",50)
            .attr("height",40)
            .attr("fill","#FFF")
            .style("stroke","#f77300")
            .style("stoke-width","1px");
          p.g.append("rect")
            .attr("transform","translate("+x(r.med_drive-55)+","+y(0.0195)+")")
            .attr("width",50)
            .attr("height",40)
            .attr("fill","#FFF")
            .style("stroke","#994700")
            .style("stoke-width","1px");
          p.g.append("text")
            .attr("class", "source")
            .attr("fill", "#f77300")
            .attr("transform", "translate("+
              (x(r.med_cyc+30)+25)+","+
              (y(0.0173))+")")
            .attr("font-size", 12)
            .style("text-anchor", "middle")
            .text("Median");
          p.g.append("text")
            .attr("class", "source")
            .attr("fill", "#f77300")
            .attr("transform", "translate("+
              (x(r.med_cyc+30)+25)+","+
              (y(0.013))+")")
            .attr("font-size", 16)
            .style("text-anchor", "middle")
            .text(Math.round(r.med_cyc));
          p.g.append("text")
            .attr("class", "source")
            .attr("fill", "#994700")
            .attr("transform", "translate("+
              (x(r.med_drive-55)+25)+","+
              (y(0.0173))+")")
            .attr("font-size", 12)
            .style("text-anchor", "middle")
            .text("Median");
          p.g.append("text")
            .attr("class", "source")
            .attr("fill", "#994700")
            .attr("transform", "translate("+
              (x(r.med_drive-55)+25)+","+
              (y(0.013))+")")
            .attr("font-size", 16)
            .style("text-anchor", "middle")
            .text(Math.round(r.med_drive));
          // End Cyc Median Callouts
          // ---------------------------


          // ---------------------------
          // Cyc Legend
          var legend = {"x":x(165),"y":y(0.0425)};
          legend.width   = x(218) - legend.x;
          legend.height  = y(.0325) - legend.y;
          legend.yOffset = 5;
          legend.yBaseline = 10;
          var legendG = p.g.append("g")

          legendG.append("rect")
            .attr("transform","translate("+legend.x+","+legend.y+")")
            .attr("width",legend.width)
            .attr("height",legend.height)
            .attr("fill","#FFF")
            .style("stroke","#CCC")
            .style("stoke-width","1px")
            .style("opacity",0.8);

          legendG.append("line")
            .attr("x1",legend.x+10)
            .attr("y1",legend.y+legend.yOffset + legend.yBaseline)
            .attr("x2",legend.x+30)
            .attr("y2",legend.y+legend.yOffset + legend.yBaseline)
            .style("fill","none")
            .style("stroke","#994700")
            .style("stroke-width","2px");

          legendG.append("text")
            .attr("class", "source")
            .attr("fill", "#000")
            .attr("transform", "translate("+
              (legend.x+40)+","+
              (legend.y+(legend.yBaseline*2))+")")
            .attr("font-size", 12)
            .style("text-anchor", "left")
            .text("Driving");

          legendG.append("line")
            .attr("x1",legend.x+10)
            .attr("y1",legend.y+legend.yOffset + (legend.yBaseline*3))
            .attr("x2",legend.x+30)
            .attr("y2",legend.y+legend.yOffset + (legend.yBaseline*3))
            .style("fill","none")
            .style("stroke","#f77300")
            .style("stroke-width","2px");

          legendG.append("text")
            .attr("class", "source")
            .attr("fill", "#000")
            .attr("transform", "translate("+
              (legend.x+40)+","+
              (legend.y+(legend.yBaseline*4))+")")
            .attr("font-size", 12)
            .style("text-anchor", "left")
            .text("Cycling");
          // End Cyc Legend
          // ---------------------------
        }
        $.when(a).then(aResolve,aReject);
      };

      this.costPerDayViz = function(d) {
        var p = this.vizPrep({
          "svgId":d.svgid,
          "tab": d.tab,
          "timeParseFormat": "%Y-%m-%d",
          "title": "Daily Average Driving Cost",
          "yLabel": "Cost Per Day ($)",
          "citation": "See other tabs for source information."
        });
        p.data = d.data;//this.costData;
        // domains
        var yDom = _.map(p.data,function(o){return o.cost;});
        var xDom = _.map(p.data,function(o){return o.date;})
        // scales
        var x = p.scaleX(moment(p.parseTime(d3.min(xDom))).subtract(30,'days'),
                         moment(p.parseTime(d3.max(xDom))).add(30,'days'));
        var y = p.scaleY(d3.min(yDom)-.5,d3.max(yDom)+.5);
        // axes
        p.xAxis(x);
        p.yAxis(y);
        // line
        var line = d3.line()
            .x(function(d) { return x(p.parseTime(d.date));})
            .y(function(d) { return y(d.cost); });
        // viz
        p.g.append("path")
          .datum(p.data)
          .attr("d",line)
          .style("fill","none")
          .style("stroke","#f77300")
          .style("stroke-width","3px");
      };

      this.cycExpensesViz = function(d) {
        var that = this;
        if(!!!tabs.cyc.loaded || !!!tabs.expenses.loaded)
          return;
        // Cycling Expenses vs Driving costs

        var p = this.vizPrep({
          "svgId": d.svgid,
          "tab": d.tab,
          "timeParseFormat": "%Y-%m-%d",
          "title": "Cycling Expenses vs Offset Driving Costs",
          "yLabel": "Expenses, Savings ($)",
          "citation": "See other tabs for source information."
        });
        //domains
        var expenses = tabs.expenses.data;

        // array of purchases
        p.data = expenses;
        var yDom  = [], costs = {};
        p.data = _.sortBy(p.data,"Date")
        for(let i=0;i<p.data.length;i++)
        {
          // populate each record with the 'total' spend so far
          if(i==0)
            p.data[i].total = parseFloat(p.data[i].Price)
          else
            p.data[i].total = parseFloat(p.data[i].Price) + p.data[i-1].total;
          yDom.push(p.data[i].total);
        }
        // calculate cumulative savings
        var offsets  = [];
        _.each(tabs.cyc.data, function(o,i) {
          // var date    = moment(o.startTime).format("YYYY-MM-DD");
          // var ym      = moment(date).format("YYYYMM");
          // var curCost = _.filter(d.data,function(m) {
          //   return moment(m.date).format("YYYYMM") == o.ym;
          // })[0].cost;
          // current Date
          //var date    = o.startDate;
          // current monthly cost
          var curCost = d.data[o.ym];
          // all expenses before current date
          //var toDates = _.filter(p.data,function(m) { return moment(m.Date).isBefore(o.startDate); });
          var toDates = _.filter(p.data,function(m) { return new Date(m.Date).getTime() < new Date(o.startDate).getTime(); });
          // total from last index
          var total   = !!!toDates || toDates.length == 0 ? 0 : toDates[toDates.length-1].total;
          var diff    = 0;
          if(/C(O|I)/.test(o.route))
          {
            o.offset  = i == 0 ? curCost * -1 : tabs.cyc.data[i-1].offset - (curCost/2);
            diff      = total+o.offset;
            offsets.push({"date":o.startDate,"offset":o.offset, "diff": diff });
          }
          else
          {
            o.offset  = i == 0 ? 0 : tabs.cyc.data[i-1].offset;
            diff      = i == 0 ? 0 : tabs.cyc.data[i-1].diff;
          }
        });

        var xDom = _.map(offsets,function(o){return o.date;});
        // scales
        var x = p.scaleX(moment(d3.min(xDom)).subtract(30,'days'),
                         moment(d3.max(xDom)).add(30,'days'));
        var y = p.scaleY(_.minBy(offsets,"offset").offset-1000,yDom[yDom.length-1]+1000);
        // axes
        p.xAxis(x);
        p.yAxis(y);
        // line
        var expenseLine = d3.line()
            .x(function(d) { return x(d.Date);})
            .y(function(d) { return y(d.total);});//y(parseFloat(d.total)); });
        var diffsLine = d3.line()
            .x(function(d) { return x(p.parseTime(d.date));})
            .y(function(d) { return y(d.diff);});//y(parseFloat(d.diff))});
        var offsetsLine = d3.line()
            .x(function(d) { return x(p.parseTime(d.date));})
            .y(function(d) { return y(d.offset);});//y(parseFloat(d.diff))});
        // viz
        p.g.append("path")
          .datum(p.data)
          .attr("d",expenseLine)
          .style("fill","none")
          .style("stroke","#f77300")
          .style("stroke-width","3px");

        p.g.append("text")
          .attr("class", "source")
          .attr("fill", "#f77300")
          .attr("transform", "translate("+
            (x(p.parseTime(offsets[offsets.length-1].date)))+","+
            (y(5700))+")")
          .attr("font-size", 12)
          .style("text-anchor", "end")
          .text("Expenses $"+Math.round(p.data[p.data.length-1].total));

        p.g.append("path")
          .datum(offsets)
          .attr("d",diffsLine)
          .style("fill","none")
          .style("stroke","#994700")
          .style("stroke-width","2px");

        p.g.append("text")
          .attr("class", "source")
          .attr("fill", "#994700")
          .attr("transform", "translate("+
            (x(p.parseTime(offsets[offsets.length-1].date)))+","+
            (y(1000))+")")
          .attr("font-size", 12)
          .style("text-anchor", "end")
          .text("Savings $"+Math.round(offsets[offsets.length-1].diff));

        p.g.append("path")
          .datum(offsets)
          .attr("d",offsetsLine)
          .style("fill","none")
          .style("stroke","#000")
          .style("stroke-width","2px");

        p.g.append("text")
          .attr("class", "source")
          .attr("fill", "#000")
          .attr("transform", "translate("+
            (x(p.parseTime(offsets[offsets.length-1].date)))+","+
            (y(-6000))+")")
          .attr("font-size", 12)
          .style("text-anchor", "end")
          .text("Offsets $"+Math.round(offsets[offsets.length-1].offset));
      }

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
