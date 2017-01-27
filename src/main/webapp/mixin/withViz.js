define(
  function(require)
  {
    var flight      = require('flight');
    var withVizPrep = require('mixin/withVizPrep');
    var moment      = require('moment');
    var d3          = require('d3');
    return withViz;
    function withViz() {
      flight.compose.mixin(this, [withVizPrep]);
      var conf = window.yadademo.content;

      var colors = ["#f77300","#994700","#FFAC80"];

      this.getTextBox = function(selection) {
        selection.each(function(d) {
          d['bbox'] = this.getBBox();
        })
      }

      this.perfViz = function(d) {
        var meatyBit = d3.select('#'+d.svgid+' .meaty-bit');
        var that = this;

        var p = this.vizPrep({
          "svgId":d.svgid,
          "tab": d.tab,
          "timeParseFormat": "%Y-%m-%d %H:%M:%S",
          "title": "Cycling Performance: Actual vs Effective Velocity*",
          "yLabel": "MPH",
          "citation": "Varon, David A. "+
            (moment().format("YYYY"))+
            " [Cyclemeter by Abvio]. Unpublished raw data"
        });

        // domains
        p.data = _(conf.data[5].data).filter(function(o) {
          return (o.route == "CI" || o.route == "CO")
           && ((o.distance/o.runTime)*conf.constants["mps-to-mph"]) < 40;
        }).value();
        p.data = _(p.data).map(function(o,i) {
          o.actVelo = (o.distance/o.runTime)*conf.constants["mps-to-mph"];
          o.effVelo = (o.distance/o.elapsedTime)*conf.constants["mps-to-mph"];
          // calc ma, ema here
          var sumn = function(sum,n){return sum+n;};
          if(i>=30)
          {
            o.actVeloSMA = _.reduce(_.chain(p.data).slice(i-30,i).map("actVelo").value(),sumn)/30;
            o.actVeloMean = _.reduce(_.chain(p.data).slice(0,i).map("actVelo").value(),sumn)/i;
            o.effVeloSMA = _.reduce(_.chain(p.data).slice(i-30,i).map("effVelo").value(),sumn)/30;
            o.effVeloMean = _.reduce(_.chain(p.data).slice(0,i).map("effVelo").value(),sumn)/i;
          }
          else if(i == 0)
          {
            o.actVeloSMA = 0;
            o.actVeloMean = 0;
            o.effVeloSMA = 0;
            o.effVeloMean = 0;
          }
          else
          {
            o.actVeloSMA = _.reduce(_.chain(p.data).slice(0,i).map("actVelo").value(),sumn)/i;
            o.actVeloMean = _.reduce(_.chain(p.data).slice(0,i).map("actVelo").value(),sumn)/i;
            o.effVeloSMA = _.reduce(_.chain(p.data).slice(0,i).map("actVelo").value(),sumn)/i;
            o.effVeloMean = _.reduce(_.chain(p.data).slice(0,i).map("actVelo").value(),sumn)/i;
          }
          return o;
        }).value();

        var yDom = _.map(p.data,function(o){return o.actVelo;});
        var xDom = _.map(p.data,function(o){return o.startTime;})

        // scales
        var x = p.scaleX(moment(p.parseTime(d3.min(xDom))).subtract(30,'days'),
                         moment(p.parseTime(d3.max(xDom))).add(30,'days'));
        var y = p.scaleY(d3.min(yDom)-.5,d3.max(yDom)+.5);

        if(!!meatyBit.node())
        {
          meatyBit.remove();
        }
        else
        {
          p.title();

          // axes
          p.xAxis(x);
          p.yAxis(y);

          p.citation();
        }

        function redraw() {

          var meatyBit = d3.select('#'+d.svgid+' g').append('g').attr('class','meaty-bit');

          // data
          p.svg.data(p.data);

          // dots
          meatyBit.selectAll('.dot')
              .data(p.data)
              .enter()
              .append("circle")
              .attr("r", 1)
              .attr("cx", function(d) {return x(p.parseTime(d.startTime));})
              .attr("cy", function(d) {return y(d.actVelo)})
              .attr("data-legend","Observed Velocity")
              .style("fill", function(d) { return colors[2];})
              .style("opacity","0.0")
              .transition()
              .duration(1000)
                .style("opacity","1.0")


          // lines
          var actSma30 = d3.line()
              .x(function(d) { return x(p.parseTime(d.startTime));})
              .y(function(d) { return y(d.actVeloSMA); });

          var actSma30Path = meatyBit.append("path")
            .datum(p.data.slice(1))
            .attr("d",actSma30)
            .attr("class","color1Line");
          var totalLength = actSma30Path.node().getTotalLength();
          actSma30Path.attr("stroke-dasharray", totalLength + ", " + totalLength)
              .attr("stroke-dashoffset", totalLength)
              .transition()
                .delay(500)
                .duration(1500)
                .attr("stroke-dashoffset", 0);

          var actMean = d3.line()
              .x(function(d) { return x(p.parseTime(d.startTime));})
              .y(function(d) { return y(d.actVeloMean); });

          var actMeanPath = meatyBit.append("path")
            .datum(p.data.slice(1))
            .attr("d",actMean)
            .attr("class","actMean")
            .style("opacity","0.0")
          totalLength = actMeanPath.node().getTotalLength();
          actMeanPath.attr("stroke-dasharray", totalLength + ", " + totalLength)
              .attr("stroke-dashoffset", totalLength)
              .transition()
                .delay(2000)
                .style("opacity","1.0")

          var effSma30 = d3.line()
              .x(function(d) { return x(p.parseTime(d.startTime));})
              .y(function(d) { return y(d.effVeloSMA); });

          var effSma30Path = meatyBit.append("path")
            .datum(p.data.slice(1))
            .attr("d",effSma30)
            .attr("class","color0Line");
          totalLength = effSma30Path.node().getTotalLength();
          effSma30Path.attr("stroke-dasharray", totalLength + ", " + totalLength)
              .attr("stroke-dashoffset", totalLength)
              .transition()
                .delay(500)
                .duration(1500)
                .attr("stroke-dashoffset", 0);

          var effMean = d3.line()
              .x(function(d) { return x(p.parseTime(d.startTime));})
              .y(function(d) { return y(d.effVeloMean); });

          var effMeanPath = meatyBit.append("path")
            .datum(p.data.slice(1))
            .attr("d",effMean)
            .attr("class","effMean")
            .style("opacity","0.0")
          totalLength = effMeanPath.node().getTotalLength();
          effMeanPath.attr("stroke-dasharray", totalLength + ", " + totalLength)
              .attr("stroke-dashoffset", totalLength)
              .transition()
                .delay(2000)
                .style("opacity","1.0")

          // ---------------------------
          // Cyc Legend

          var legend = {x: 0, y: 0}
          legend.yOffset = 12;
          legend.yBaseline = 16;
          var legendG = meatyBit.append("g");

          legendG.append("rect")
            .attr("width",300)
            .attr("height",-5+(legend.yBaseline*7)-2)
            .attr("fill","#FFF")
            .style("stroke","#CCC")
            .style("stoke-width","1px")
            .style("opacity",0.8);

          legendG.append("circle")
            .attr("r",3)
            .attr("cx",20)
            .attr("cy",legend.yOffset)
            .style("fill", function(d) { return colors[2];});

          legendG.append("text")
            .attr("class", "source")
            .attr("transform", "translate("+40+","+legend.yBaseline+")")
            .text("Mean observed actual velocity per round trip");

          legendG.append("line")
            .attr("x1",10)
            .attr("y1",legend.yOffset + legend.yBaseline)
            .attr("x2",30)
            .attr("y2",legend.yOffset + legend.yBaseline)
            .attr("class","color1Line");

          legendG.append("text")
            .attr("class", "source")
            .attr("transform", "translate("+40+","+(legend.yBaseline*2)+")")
            .text("Actual velocity, 30-period simple moving average");

          legendG.append("line")
            .attr("x1",10)
            .attr("y1",legend.yOffset + (legend.yBaseline*2))
            .attr("x2",30)
            .attr("y2",legend.yOffset + (legend.yBaseline*2))
            .attr("class","actMean");

          legendG.append("text")
            .attr("class","source")
            .attr("transform", "translate("+40+","+(legend.yBaseline*3)+")")
            .text("Actual velocity, overall running average");

          legendG.append("line")
            .attr("x1",10)
            .attr("y1",legend.yOffset + (legend.yBaseline*3))
            .attr("x2",30)
            .attr("y2",legend.yOffset + (legend.yBaseline*3))
            .attr("class","color0Line");

          legendG.append("text")
            .attr("class", "source")
            .attr("transform", "translate("+40+","+(legend.yBaseline*4)+")")
            .text("Effective velocity, 30-period simple moving average");

          legendG.append("line")
            .attr("x1",10)
            .attr("y1",75)
            .attr("x2",30)
            .attr("y2",75)
            .attr("class","effMean");

          legendG.append("text")
            .attr("class", "source")
            .attr("transform", "translate("+40+","+(legend.yBaseline*5)+")")
            .text("Effective velocity, overall running average");

          legendG.append("text")
            .attr("class", "source")
            .attr("transform", "translate("+40+","+(legend.yBaseline*6)+")")
            .text("*Effective velocity = distance / elapsed time");

          //var legend = {"x": x(p.parseTime("2013-02-01 00:00:00")),"y":y(11.00)};
          legendG.attr("transform","translate("
            +x(p.parseTime("2012-06-01 00:00:00"))+","
            +y(12.50)
            +")")

          // End Cyc Legend
          // ---------------------------

          var lineLabel = Math.round(p.data[p.data.length-1].actVeloSMA*100)/100;
          var fontSize  = 10;
          p.g.append("text")
                .attr("fill", colors[1])
                .attr("transform", "translate("+(p.width-10)+","+(y(lineLabel))+")")
                .attr("font-size", fontSize)
                .style("text-anchor", "left")
                .style("opacity","0.0")
                .text(lineLabel)
                .transition()
                .delay(2000)
                  .style("opacity","1.0")

          lineLabel = Math.round(p.data[p.data.length-1].actVeloMean*100)/100;
          p.g.append("text")
                .attr("fill", colors[1])
                .attr("transform", "translate("+(p.width-10)+","+(y(lineLabel))+")")
                .attr("font-size", fontSize)
                .style("text-anchor", "left")
                .style("opacity","0.0")
                .text(lineLabel)
                .transition()
                .delay(2000)
                  .style("opacity","1.0")

          lineLabel = Math.round(p.data[p.data.length-1].effVeloSMA*100)/100;
          p.g.append("text")
                .attr("fill", colors[0])
                .attr("transform", "translate("+(p.width-10)+","+(y(lineLabel))+")")
                .attr("font-size", fontSize)
                .style("text-anchor", "left")
                .style("opacity","0.0")
                .text(lineLabel)
                .transition()
                .delay(1500)
                  .style("opacity","1.0")

          lineLabel = Math.round(p.data[p.data.length-1].effVeloMean*100)/100;
          p.g.append("text")
                .attr("fill", colors[0])
                .attr("transform", "translate("+(p.width-10)+","+(y(lineLabel))+")")
                .attr("font-size", fontSize)
                .style("text-anchor", "left")
                .style("opacity","0.0")
                .text(lineLabel)
                .transition()
                .delay(1500)
                  .style("opacity","1.0")

          // citation: exec last to keep on top
          //p.citation();
        }
        redraw();
      };

      this.expensesViz = function(d) {
        var p = this.vizPrep({
          "svgId":d.svgid,
          "tab":d.tab,
          "timeParseFormat":"%d-%b-%Y",
          "title":"Expenses over time",
          "yLabel":"Expenses ($)",
          "citation":"Varon, David A. "+
            (moment().format("YYYY"))+
            " [Personal Spreadsheet]. Unpublished raw data"
        });

        p.data =  conf.data[conf.panels[d.id].data].data;
        // domains
        var yDom  = [];
        if(!!!p.data[0].Date)
        {
          for(let i=0;i<p.data.length;i++)
          {
            p.data[i].Date = this.getDateFromOracleString(p.data[i].PURCHASEDATE);
          }
        }
        p.data = _.sortBy(p.data,"Date")
        for(let i=0;i<p.data.length;i++)
        {
          if(i==0) p.data[i].total = parseFloat(p.data[i].PRICE)
          else p.data[i].total = parseFloat(p.data[i].PRICE) + p.data[i-1].total;
          yDom.push(p.data[i].total);
        }
        var xDom = _.map(p.data,function(o){return o.Date;});

        // scales
        var x = p.scaleX(moment(d3.min(xDom)).subtract(30,'days'),
                         moment(d3.max(xDom)).add(30,'days'));
        var y = p.scaleY(0,yDom[yDom.length-1]);

        // axes
        p.xAxis(x);
        p.yAxis(y);

        // data
        p.svg.data(p.data);

        // line
        var line = d3.line()
            .x(function(d) { return x(d.Date); })
            .y(function(d) { return y(parseFloat(d.total)); });
        p.g.append("path")
            .datum(p.data)
            .attr("class", "line")
            .attr("d", line);

        // citation: keep at end to render on top
        p.citation();
      };

      this.gasViz = function(d) {
        var p     = this.vizPrep({
          "svgId":d.svgid,
          "tab":d.tab,
          "timeParseFormat":"%d-%b-%y",
          "title": "Monthly Average Gas Prices, Boston-Brockton-Nashua, MA-NH-ME-CT",
          "yLabel": "Price ($)",
          "citation": "Bureau of Labor Statistics, U.S. Department of Labor, Consumer Price Index, ["+
                moment().format("MM/DD/YYYY")+
                "] [https://api.bls.gov/publicAPI/v2/timeseries/data/]."
        });

        // domains
        p.data = _(p.data).map(function(o) {
          return { date: new Date(o.year,o.period.slice(1),0),
                   close: +o.value}
        }).sortBy("date").filter(function(o) { return o.date.getTime() > new Date(2011,6,1);}).value();

        var yDom = _.map(p.data,function(o){return o.close});
        var xDom = _.map(p.data,function(o){return o.date});

        // scales
        var x = p.scaleX(moment(d3.min(xDom)).subtract(30,'days'),
                         moment(d3.max(xDom)).add(30,'days'));
        var y = p.scaleY(1.5,d3.max(yDom)+.2);

        // axes
        p.xAxis(x);
        p.yAxis(y);

        // data
        p.svg.data(p.data);

        // line
        var line = d3.line()
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(d.close); });

        p.g.append("path")
            .datum(p.data)
            .attr("class", "line")
            .attr("d", line);

        // citation: keep at end to render on top
        p.citation();
      };

      this.weatherViz = function(d) {
        var meatyBit = d3.select('#'+d.svgid+' .meaty-bit');
        var that = this;

        var p = this.vizPrep({
          "svgId":d.svgid,
          "tab": d.tab,
          "timeParseFormat": "%Y-%m-%d %H:%M:%S",
          "title": "Temperature and Wind Speed on Cycling Days",
          "yLabel": "ºC or MPH",
          "citation": "National Centers for Environmental Information, National Oceanic and Atmospheric Administration, Climate Data Online, ["+
                moment().format("MM/DD/YYYY")+
                "] [ftp://ftp.ncdc.noaa.gov/pub/data/noaa/]."
        });

        p.data = _.filter(conf.data[3].data,function(o) {
          return parseInt(o.temp) <= 100;
        });
        // domains
        var yDom = _.map(p.data,function(o){return parseFloat(o.temp)});
        var xDom = _.map(p.data,function(o){return o.starttime;})

        // scales
        var xMin = moment(p.parseTime(d3.min(xDom))).subtract(30,'days');
        var xMax = moment(p.parseTime(d3.max(xDom))).add(30,'days');
        var yMin = d3.min(yDom)-5;
        var yMax = d3.max(yDom)+5;
        var x = p.scaleX(xMin,xMax);
        var y = p.scaleY(yMin,yMax);

        if(!!meatyBit.node())
        {
          meatyBit.remove();
        }
        else
        {
          //title
          p.title();
          // axes
          p.xAxis(x);
          p.yAxis(y);
        }

        function redraw() {
          // data
          p.svg.data(p.data);

          var meatyBit = d3.select('#'+d.svgid+' g').append('g').attr('class','meaty-bit');

          // dots
          var wind = meatyBit.append("g");
          wind.selectAll('.dot')
              .data(p.data)
              .enter()
              .append("circle")
              .attr('class','dot')
              .attr("r", 1)
              .attr("cx", function(d) {return x(p.parseTime(d.starttime));})//x();})
              .attr("cy", function(d) {return y(yMax);})//y();})
              .style("fill", function(d) { return colors[1];})
              .style("opacity","0.0")

          wind.selectAll("circle").each(function(o,j) {
              d3.select(this).transition()
              // .delay(100)
              .delay(parseInt(Math.random()*1000))
              .ease(d3.easeBounceOut)
              .duration(1000)
              .attr("cx", function(d) {return x(p.parseTime(d.starttime));})
              .attr("cy", function(d) {return y(parseFloat(d.windspd));})
              .style("opacity","1.0")
            });

          var temp = meatyBit.append("g");
          temp.selectAll('.dot')
              .data(p.data)
              .enter()
              .append("circle")
              .attr('class','dot')
              .attr("r", 1)
              .attr("cx", function(d) {return x(p.parseTime(d.starttime));})//x((xMax-xMin)/2);})
              .attr("cy", function(d) {return y(yMax);})//y((yMax-yMin)/2);})
              .style("fill", function(d) { return colors[0];})
              .style("opacity","0.0")

          temp.selectAll("circle").each(function(o,j){
              d3.select(this).transition()
              // .delay(100)
              .delay(parseInt(Math.random()*1000))
              .ease(d3.easeBounceOut)
              .duration(1000)
              .attr("cx", function(d) {return x(p.parseTime(d.starttime));})
              .attr("cy", function(d) {return y(parseFloat(d.temp));})
              .style("opacity","1.0")
          })
          // ---------------------------
          // Weather Legend
          var legend = {"x": x(p.parseTime("2013-06-01 00:00:00")),"y":y(-11.40)};
          legend.width     = x(p.parseTime("2015-12-01 00:00:00")) - legend.x;
          legend.height    = y(-14.75)-legend.y;
          legend.yOffset   = 10;
          legend.yBaseline = legend.yOffset + 5;

          var legendG = meatyBit.append("g")

          legendG.append("rect")
            .attr("width",250)
            .attr("height",25)
            .attr("fill","#FFF")
            .style("stroke","#CCC")
            .style("stoke-width","1px")
            .style("opacity",0.9);

          legendG.append("circle")
            .attr("r",3)
            .attr("cx",20)
            .attr("cy",legend.yOffset)
            .style("fill", function(d) { return colors[0];})

          legendG.append("text")
            .attr("class", "source")
            .attr("transform", "translate("+(30)+","+(legend.yBaseline)+")")
            .text("Temperature (ºC)");

          legendG.append("circle")
            .attr("r",3)
            .attr("cx",140)
            .attr("cy",legend.yOffset)
            .style("fill", function(d) { return colors[1];})

          legendG.append("text")
            .attr("class", "source")
            .attr("transform", "translate("+(150)+","+(legend.yBaseline)+")")
            .text("Wind Speed (MPH)");

          legendG.attr("transform","translate("+legend.x+","+legend.y+")")

          // End Weather Legend
          // ---------------------------
          // citation: exec last to keep on top
          p.citation();
        }
        redraw();
      };

      this.sleepViz = function(d) {
        var p = this.vizPrep({
          "svgId":d.svgid,
          "tab": d.tab,
          "timeParseFormat": "%Y-%m-%d %H:%M:%S",
          "title": "Hours of Sleep",
          "yLabel": "Hours of Sleep",
          "citation": "Varon, David A. "+
            (moment().format("YYYY"))+
            " [SleepCycle by Northcube AB]. Unpublished raw data"
        });

        p.data =  conf.data[conf.panels[d.id].data].data;

        // domains
        var yDom = _.map(p.data,function(o){return moment.duration(o["Time in bed"]).asHours();});
        var xDom = _.map(p.data,function(o){return o.End;})

        // scales
        var x = p.scaleX(moment(p.parseTime(d3.min(xDom))).subtract(30,'days'),
                         moment(p.parseTime(d3.max(xDom))).add(30,'days'));
        var y = p.scaleY(0,d3.max(yDom)+.5);

        // axes
        p.xAxis(x,5);
        p.yAxis(y);

        // data
        p.svg.data(p.data);

        // dots
        p.g.selectAll('.dot')
            .data(p.data)
            .enter()
            .append("circle")
            .attr('class','dot')
            .attr("r", 1)
            .attr("cx", function(d) {return x(p.parseTime(d.End));})
            .attr("cy", function(d) {return y(moment.duration(d["Time in bed"]).asHours())})
            .style("fill", function(d) { return colors[0];})

        // citation: exec last to keep on top
        p.citation();
      };

      this.cycVsDriveViz = function(d) {
        var meatyBit = d3.select('#'+d.svgid+' .meaty-bit');
        var that = this;
        // data
        var r    = conf.data[conf.panels[d.id].data].data;
        var cyc=r.KDE_cyc,
            drv=r.KDE_drive;
        // domains
        var xDomCyc = _.map(cyc,function(o){return o.x;})
        var xDomDrv = _.map(drv,function(o){return o.x;})
        var yDomCyc = _.map(cyc,function(o){return o.y;})
        var yDomDrv = _.map(drv,function(o){return parseFloat(o.y);})

        var p = that.vizPrep({
          "svgId":d.svgid,
          "tab": d.tab,
          "timeParseFormat": "%Y-%m-%d",
          "title": "Round Trip Elapsed Time: Cycling Vs Driving",
          "yLabel": "Probability",
          "xLabel": "Minutes",
          "citation": "See other tabs for source information."
        });

        // scales
        p.scaleX = function(min,max) {
          return d3.scaleLinear()
            .rangeRound([0, p.width-10])
            .domain([min,max]);
        };
        var x = p.scaleX(d3.min(xDomDrv)-10,d3.max(xDomCyc)+10);
        var y = p.scaleY(0,d3.max(yDomCyc)+.01);

        // Elapsed Time Cycling vs Driving
        if(!!meatyBit.node())
        {
          meatyBit.remove();
        }
        else
        {
          //title
          p.title();
          // axes
          p.xAxis(x);
          p.yAxis(y);
        }

        function redraw() {
          // line
          var line = d3.line()
              .x(function(d) { return x(d.x);})
              .y(function(d) { return y(d.y);});
          // viz
          var meatyBit = d3.select('#'+d.svgid+' g').append('g').attr('class','meaty-bit');

          var pathPre1 = meatyBit.append("path")
              .attr("d",line(cyc))
              .style("fill",colors[0])
              .style("opacity","0.0")
              .style("stroke",colors[1])
              .style("stroke-width","1px");

          var path1 = meatyBit.append("path")
              .attr("d",line(cyc))
              .style("fill","none")
              .style("opacity","0.7")
              .style("stroke",colors[0])
              .style("stroke-width","2px");

          var totalLength = path1.node().getTotalLength();

          path1.attr("stroke-dasharray", totalLength + ", " + totalLength)
              .attr("stroke-dashoffset", totalLength)
              .transition()
                .duration(1500)
                .attr("stroke-dashoffset", 0);

          pathPre1.transition()
              .delay(1500)
              .duration(1000)
              .style("opacity","0.7");

          var pathPre2 = meatyBit.append("path")
              .attr("d",line(drv))
              .style("fill",colors[1])
              .style("opacity","0.0")
              .style("stroke",colors[1])
              .style("stroke-width","1px");

          var path2 = meatyBit.append("path")
              .attr("d",line(drv))
              .style("fill","none")
              .style("opacity","0.7")
              .style("stroke",colors[1])
              .style("stroke-width","1px");

          totalLength = path2.node().getTotalLength();
          path2.attr("stroke-dasharray", totalLength + " " + totalLength)
              .attr("stroke-dashoffset", totalLength)
              .transition()
                .duration(1500)
                .attr("stroke-dashoffset", 0);

          pathPre2.transition()
              .delay(1500)
              .duration(1000)
              .style("opacity","0.7");


          // ---------------------------
          // Cyc Medians
          var bisect = d3.bisector(function(d) { return d.x; }).left;
          var item   = cyc[bisect(cyc,r.med_cyc)];
          var y2Cyc     = y(item.y);
          var med1 = meatyBit.append("line")
            .attr("x1",x(r.med_cyc))
            .attr("y1",p.height)
            .attr("x2",x(r.med_cyc))
            .attr("y2",p.height)
            .attr("stroke-dasharray","10,5")
            .style("fill","none")
            .style("stroke",colors[0])
            .style("stroke-width","2px")
            .transition()
                .delay(1500)
                .duration(1500)
                .attr("y2",y2Cyc);


          item = drv[bisect(drv,r.med_drive)];
          var y2Drv   = y(item.y);
          var med2 = meatyBit.append("line")
            .attr("x1",x(r.med_drive))
            .attr("y1",p.height)
            .attr("x2",x(r.med_drive))
            .attr("y2",p.height)
            .attr("stroke-dasharray","10,5")
            .style("fill","none")
            .style("stroke",colors[1])
            .style("stroke-width","2px")
            .transition()
                .delay(1500)
                .duration(1500)
                .attr("y2",y2Drv);
          // End Cyc Medians
          // ---------------------------

          // ---------------------------
          // Cyc Median Callouts
          var t3k = d3.transition().delay(3000);

          var medCalloutCyc = meatyBit.append("g");
          var medCalloutDrv = meatyBit.append("g");

          medCalloutCyc.append("line")
              .attr("x1","0").attr("y1","0")
              .attr("x2","30").attr("y2","0")
              .classed("color0Line1px",true)
              .style("opacity",0.0);
          medCalloutCyc.append("rect")
              .attr("x","30").attr("y","-20")
              .attr("width","50").attr("height","40")
              .classed("color0Rect",true)
              .style("opacity","0.0");
          medCalloutCyc.append("text")
              .attr("x",(30+50/2)).attr("y",(-4))
              .text("Median")
              .style("opacity","0.0");
          medCalloutCyc.append("text")
              .attr("x",(30+50/2)).attr("y",(20-6))
              .text(Math.round(r.med_cyc))
              .style("opacity","0.0");
          medCalloutCyc.selectAll("text").classed("color0callout",true);

          medCalloutCyc.selectAll("*")
              .transition(t3k)
              .attr("transform","translate("
                  +(x(r.med_cyc))+","+(p.height-y2Cyc/2-20)+")")
              .transition()
              .delay(100)
              .style("opacity","1.0");


          medCalloutDrv.append("line")
              .attr("x1",0).attr("y1",0)
              .attr("x2",-30).attr("y2",0)
              .classed("color1Line1px",true)
              .style("opacity","0.0");
          medCalloutDrv.append("rect")
              .attr("x",-80).attr("y",-20)
              .attr("width",50).attr("height",40)
              .classed("color1Rect",true)
              .style("opacity","0.0");
          medCalloutDrv.append("text")
              .attr("x",(-80+50/2)).attr("y",(-4))
              .text("Median")
              .style("opacity","0.0");
          medCalloutDrv.append("text")
              .attr("x",(-80+50/2)).attr("y",(20-6))
              .text(Math.round(r.med_drive))
              .style("opacity","0.0");;

          medCalloutDrv.selectAll("text").classed("color1callout",true);

          medCalloutDrv.selectAll("*")
              .transition(t3k)
              .attr("transform","translate("
                  +(x(r.med_drive))+","+(p.height-y2Cyc/2-20)+")")
              .transition()
              .delay(100)
              .style("opacity","1.0");


          // End Cyc Median Callouts
          // ---------------------------


          // ---------------------------
          // Cyc Legend
          var legend = {"x":x(165),"y":y(0.0425)};
          legend.width   = x(205) - legend.x;
          legend.height  = y(.0325) - legend.y;
          legend.yOffset = 5;
          legend.yBaseline = 10;
          var legendG = meatyBit.append("g")

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
            .attr("y1",legend.y+legend.height*.25)
            .attr("x2",legend.x+30)
            .attr("y2",legend.y+legend.height*.25)
            .attr("class", "color1Line");

          legendG.append("text")
            .attr("class","legend")
            .attr("transform", "translate("+
              (legend.x+35)+","+
              (legend.y+legend.height*.25+4)+")")
            .text("Driving");

          legendG.append("line")
            .attr("x1",legend.x+10)
            .attr("y1",legend.y+legend.height*.75)
            .attr("x2",legend.x+30)
            .attr("y2",legend.y+legend.height*.75)
            .attr("class", "color0Line");

          legendG.append("text")
            .attr("class","legend")
            .attr("transform", "translate("+
              (legend.x+35)+","+
              (legend.y+legend.height*.75+4)+")")
            .text("Cycling");
          // End Cyc Legend
          // ---------------------------
        }
        redraw();
      };

      this.buildGasMap = function() {
        var that = this;
        if(!!!this.gasMap)
        {
          this.gasMap = {};
          // build a hash of gas prices by month
          _.each(conf.data[1].data,function(n) {
            that.gasMap[n.year+n.period.slice(1)] = n.value;
          });
        }
      };

      this.costPerDayDrv = function(event) {
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

      this.cycGasPrep = function() {
        var that = this;

        // setTimeout(function() {
        //   // only run if both data sets have loaded
          if(!!!this.cycGasPrepExecuted)
          {
            this.cycGasPrepExecuted = true;
            that.costData = [];
            that.costMap  = {};
            that.buildGasMap();
            var minDate = moment(conf.data[5].data[0].startDate);
            var maxDate = moment();
            var months  = [];
            while (maxDate > minDate) {
               months.push(minDate.format('YYYYMM'));
               minDate.add(1,'month');
            };
            _.each(months, function(o) {
              let d         = new Date(o.slice(0,4),parseInt(o.slice(4))-1,1)
              let scenarios = that.costPerDayDrv(d);
              let meanCost  = _.reduce(scenarios,function(sum,n) { return sum+n})/scenarios.length;
              that.costData.push({"date":moment(d).format("YYYY-MM-DD"),"cost":meanCost});
              that.costMap[o.toString()] = meanCost;
            });
          }
        // },100);
      };

      this.cycExpensesViz = function(opt) {
        var meatyBit = d3.select('#'+opt.svgid+' .meaty-bit');

        this.cycGasPrep();
        var that = this;
        // Cycling Expenses vs Driving costs
        var expenses = conf.data[2].data;
        var cycData  = conf.data[5].data;
        var gasData  = conf.data[1].data;

        var p = this.vizPrep({
          "svgId": opt.svgid,
          "tab": opt.tab,
          "timeParseFormat": "%Y-%m-%d",
          "title": "Cycling Expenses vs Offset Driving Costs",
          "yLabel": "Expenses, Savings ($)",
          "citation": "See other tabs for source information."
        });
        //domains


        // array of purchases

        var yDom  = [], costs = {};
        if(!!!expenses[0].Date)
        {
          for(let i=0;i<expenses.length;i++)
          {
            expenses[i].Date = this.getDateFromOracleString(expenses[i].PURCHASEDATE);
          }
        }
        expenses = _.sortBy(expenses,"Date")
        for(let i=0;i<expenses.length;i++)
        {
          // populate each record with the 'total' spend so far
          if(i==0)
            expenses[i].total = parseFloat(expenses[i].PRICE)
          else
            expenses[i].total = parseFloat(expenses[i].PRICE) + expenses[i-1].total;
          yDom.push(expenses[i].total);
        }
        // calculate cumulative savings
        var offsets  = [];
        _.each(cycData, function(o,i) {
          // current monthly cost
          var curCost = that.costMap[o.ym];
          // all expenses before current date
          var toDates = _.filter(expenses,function(m) { return new Date(m.Date).getTime() < new Date(o.startDate).getTime(); });
          // total from last index
          var total   = !!!toDates || toDates.length == 0 ? 0 : toDates[toDates.length-1].total;
          var diff    = 0;
          if(/C(O|I)/.test(o.route))
          {
            o.offset  = i == 0 ? curCost * -1 : cycData[i-1].offset - (curCost/2);
            diff      = total+o.offset;
            offsets.push({"date":o.startDate,"offset":o.offset, "diff": diff });
          }
          else
          {
            o.offset  = i == 0 ? 0 : cycData[i-1].offset;
            diff      = i == 0 ? 0 : cycData[i-1].diff;
          }
        });

        var xDom = _.map(offsets,function(o){return o.date;});
        // scales
        var x = p.scaleX(moment(d3.min(xDom)).subtract(30,'days'),
                         moment(d3.max(xDom)).add(30,'days'));
        var y = p.scaleY(_.minBy(offsets,"offset").offset-1000,yDom[yDom.length-1]+1000);

        if(!!meatyBit.node())
        {
          meatyBit.remove();
        }
        else
        {
          p.title();
          // axes
          p.xAxis(x);
          p.yAxis(y);
        }

        function redraw() {
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
          var meatyBit = d3.select('#'+opt.svgid+' g').append('g').attr('class','meaty-bit');

          var expPath = meatyBit.append("path")
            .datum(expenses)
            .attr("d",expenseLine)
            .attr("class","color0Line");

          var totalLength = expPath.node().getTotalLength();

          expPath.attr("stroke-dasharray", totalLength + ", " + totalLength)
              .attr("stroke-dashoffset", totalLength)
              .transition()
                .duration(1500)
                .attr("stroke-dashoffset", 0);

          meatyBit.append("text")
            .attr("fill", colors[0])
            .attr("transform", "translate("+
              (x(p.parseTime(offsets[offsets.length-1].date)))+","+
              (y(5700))+")")
            .attr("font-size", 12)
            .style("text-anchor", "end")
            .style("opacity","0.0")
            .text("Expenses $"+Math.round(expenses[expenses.length-1].total))
            .transition()
            .delay(1500)
              .style("opacity","1.0");


          var diffPath = meatyBit.append("path")
            .datum(offsets)
            .attr("d",diffsLine)
            .attr("class","color1Line");

          totalLength = diffPath.node().getTotalLength();

          diffPath.attr("stroke-dasharray", totalLength + ", " + totalLength)
              .attr("stroke-dashoffset", totalLength)
              .transition()
                .duration(1500)
                .attr("stroke-dashoffset", 0);

          meatyBit.append("text")
            .attr("fill", colors[1])
            .attr("transform", "translate("+
              (x(p.parseTime(offsets[offsets.length-1].date)))+","+
              (y(1000))+")")
            .attr("font-size", 12)
            .style("text-anchor", "end")
            .style("opacity","0.0")
            .text("Savings $"+Math.round(offsets[offsets.length-1].diff))
            .transition()
            .delay(1500)
              .style("opacity","1.0");


          var offPath = meatyBit.append("path")
            .datum(offsets)
            .attr("d",offsetsLine)
            .attr("class","offsetsLine");

          totalLength = offPath.node().getTotalLength();

          offPath.attr("stroke-dasharray", totalLength + ", " + totalLength)
              .attr("stroke-dashoffset", totalLength)
              .transition()
                .duration(1500)
                .attr("stroke-dashoffset", 0);

          meatyBit.append("text")
            .attr("class", "source")
            .attr("fill", "#000")
            .attr("transform", "translate("+
              (x(p.parseTime(offsets[offsets.length-1].date)))+","+
              (y(-6000))+")")
            .attr("font-size", 12)
            .style("text-anchor", "end")
            .style("opacity","0.0")
            .text("Offsets $"+Math.round(offsets[offsets.length-1].offset))
            .transition()
            .delay(1500)
              .style("opacity","1.0");
        }
        redraw();
      }

      this.costPerDayViz = function(opt) {
        var meatyBit = d3.select('#'+opt.svgid+' .meaty-bit');

        this.cycGasPrep();
        var that = this;

        var p = this.vizPrep({
          "svgId":opt.svgid,
          "tab": opt.tab,
          "timeParseFormat": "%Y-%m-%d",
          "title": "Daily Average Driving Cost",
          "yLabel": "Cost Per Day ($)",
          "citation": "See other tabs for source information."
        });
        p.data = this.costData;
        var expenses = _.map(_.sortBy(conf.data[2].data,"Date"),_.clone);
        var dates    = _.map(_(conf.data[5].data)
                            .sortBy("startDate")
                            .filter(function(o) { return /C(O|I)/.test(o.route)})
                            .value(),"startDate");
        _.each(expenses, function(o,i) {
          o.Date = moment(o.Date).format('YYYY-MM-DD');
          o.cpd  = o.total/(_.indexOf(dates, o.Date)+1)/2;
        })
        expenses = _.filter(expenses, function(o) { return o.cpd <= 25;});
        // domains
        var yDom = _.map(p.data,function(o){return o.cost;});
        var xDom = _.map(p.data,function(o){return o.date;})
        // scales
        var x = p.scaleX(moment(p.parseTime(d3.min(xDom))).subtract(30,'days'),
                         moment(p.parseTime(d3.max(xDom))).add(30,'days'));
        //var y = p.scaleY(d3.min(yDom)-.5,d3.max(yDom)+.5);
        var y = p.scaleY(0,d3.max(yDom)+.5);
        if(!!meatyBit.node())
        {
          meatyBit.remove();
        }
        else
        {
          p.title();
          // axes
          p.xAxis(x);
          p.yAxis(y);
        }
        function redraw() {
          // line
          var line = d3.line()
              .x(function(d) { return x(p.parseTime(d.date));})
              .y(function(d) { return y(d.cost); });

          var expLine = d3.line()
              .x(function(d) { return x(p.parseTime(d.Date));})
              .y(function(d) { return y(d.cpd);});

          var meatyBit = d3.select('#'+opt.svgid+' g').append('g').attr('class','meaty-bit');
          // viz
          var path = meatyBit.append("path")
            .datum(p.data)
            .attr("d",line)
            .attr("class","color0Line");

          var path2 = meatyBit.append("path")
            .datum(expenses)
            .attr("d",expLine)
            .attr("class","color1Line");

          var totalLength = path.node().getTotalLength();

          path.attr("stroke-dasharray", totalLength + ", " + totalLength)
              .attr("stroke-dashoffset", totalLength)
              .transition()
                .duration(1500)
                .attr("stroke-dashoffset", 0);

          totalLength = path2.node().getTotalLength();

          path2.attr("stroke-dasharray", totalLength + ", " + totalLength)
              .attr("stroke-dashoffset", totalLength)
              .transition()
                .duration(1500)
                .attr("stroke-dashoffset", 0);
        };
        redraw();
      }
    }
  }
);
