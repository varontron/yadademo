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


      this.getTextBox = function(selection) {
        selection.each(function(d) { d['bbox'] = this.getBBox(); })
      }

      this.cycViz = function(d) {
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
        p.data = _(p.data).filter(function(o) {
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

        // axes
        p.xAxis(x);
        p.yAxis(y);

        // data
        p.svg.data(p.data);

        // dots
        p.g.selectAll('.dot')
            .data(p.data)
            .enter()
            .append("circle")
            .attr('class','dot')
            .attr("r", 2)
            .attr("cx", function(d) {return x(p.parseTime(d.startTime));})
            .attr("cy", function(d) {return y(d.actVelo)})
            .attr("data-legend","Observed Velocity")
            .style("fill", function(d) { return "#FFAC80";});

        // lines
        var actSma30 = d3.line()
            .x(function(d) { return x(p.parseTime(d.startTime));})
            .y(function(d) { return y(d.actVeloSMA); });

        p.g.append("path")
          .datum(p.data.slice(1))
          .attr("d",actSma30)
          .style("fill","none")
          .style("stroke","#994700")
          .style("stroke-width","2px");

        var actMean = d3.line()
            .x(function(d) { return x(p.parseTime(d.startTime));})
            .y(function(d) { return y(d.actVeloMean); });

        p.g.append("path")
          .datum(p.data.slice(1))
          .attr("d",actMean)
          .attr("stroke-dasharray","10,5")
          .style("fill","none")
          .style("stroke","#994700")
          .style("stroke-width","2px")

        var effSma30 = d3.line()
            .x(function(d) { return x(p.parseTime(d.startTime));})
            .y(function(d) { return y(d.effVeloSMA); });

        p.g.append("path")
          .datum(p.data.slice(1))
          .attr("d",effSma30)
          .style("fill","none")
          .style("stroke","#f77300")
          .style("stroke-width","2px");

        var effMean = d3.line()
            .x(function(d) { return x(p.parseTime(d.startTime));})
            .y(function(d) { return y(d.effVeloMean); });

        p.g.append("path")
          .datum(p.data.slice(1))
          .attr("d",effMean)
          .attr("stroke-dasharray","10,5")
          .style("fill","none")
          .style("stroke","#f77300")
          .style("stroke-width","2px")

        // ---------------------------
        // Cyc Legend
        var legend = {"x": x(p.parseTime("2013-02-01 00:00:00")),"y":y(11.00)};
        legend.width   = x(p.parseTime("2015-05-01 00:00:00")) - legend.x;
        legend.height  = y(9.10)-legend.y;
        legend.yOffset = 11;
        legend.yBaseline = 16;
        var legendG = p.g.append("g")

        legendG.append("rect")
          .attr("transform","translate("+legend.x+","+legend.y+")")
          .attr("width",legend.width)
          .attr("height",legend.height)
          .attr("fill","#FFF")
          .style("stroke","#CCC")
          .style("stoke-width","1px")
          .style("opacity",0.8);

        legendG.append("circle")
          .attr("r",3)
          .attr("cx",legend.x + 20)
          .attr("cy",legend.y + legend.yOffset)
          .style("fill", function(d) { return "#FFAC80";});

        legendG.append("text")
          .attr("class", "source")
          .attr("fill", "#000")
          .attr("transform", "translate("+
            (legend.x+40)+","+
            (legend.y+legend.yBaseline)+")")
          .attr("font-size", 12)
          .style("text-anchor", "left")
          .text("Mean observed actual velocity per round trip");

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
          .text("Actual velocity, 30-period simple moving average");

        legendG.append("line")
          .attr("x1",legend.x+10)
          .attr("y1",legend.y+legend.yOffset + (legend.yBaseline*2))
          .attr("x2",legend.x+30)
          .attr("y2",legend.y+legend.yOffset + (legend.yBaseline*2))
          .attr("stroke-dasharray","10,5")
          .style("fill","none")
          .style("stroke","#994700")
          .style("stroke-width","2px");

        legendG.append("text")
          .attr("class", "source")
          .attr("fill", "#000")
          .attr("transform", "translate("+
            (legend.x+40)+","+
            (legend.y+(legend.yBaseline*3))+")")
          .attr("font-size", 12)
          .style("text-anchor", "left")
          .text("Actual velocity, overall running average");

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
          .text("Effective velocity, 30-period simple moving average");

        legendG.append("line")
          .attr("x1",legend.x+10)
          .attr("y1",legend.y+75)
          .attr("x2",legend.x+30)
          .attr("y2",legend.y+75)
          .attr("stroke-dasharray","10,5")
          .style("fill","none")
          .style("stroke","#f77300")
          .style("stroke-width","2px");

        legendG.append("text")
          .attr("class", "source")
          .attr("fill", "#000")
          .attr("transform", "translate("+
            (legend.x+40)+","+
            (legend.y+(legend.yBaseline*5))+")")
          .attr("font-size", 12)
          .style("text-anchor", "left")
          .text("Effective velocity, overall running average");

        p.g.append("text")
          .attr("class", "source")
          .attr("fill", "#000")
          //.attr("transform", "translate("+(p.width-10)+","+((p.height+p.margin.top))+")")
          .attr("transform", "translate("+
            (legend.x+10)+","+
            (legend.y+(legend.yBaseline*6))+")")
          .attr("font-size", 12)
          .style("text-anchor", "left")
          .text("*Effective velocity = distance / elapsed time");

        // End Cyc Legend
        // ---------------------------

        var lineLabel = Math.round(p.data[p.data.length-1].actVeloSMA*100)/100;
        var fontSize  = 10;
        p.g.append("text")
              .attr("class", "source")
              .attr("fill", "#994700")
              .attr("transform", "translate("+(p.width-10)+","+(y(lineLabel))+")")
              .attr("font-size", fontSize)
              .style("text-anchor", "left")
              .text(lineLabel);
        lineLabel = Math.round(p.data[p.data.length-1].actVeloMean*100)/100;
        p.g.append("text")
              .attr("class", "source")
              .attr("fill", "#994700")
              .attr("transform", "translate("+(p.width-10)+","+(y(lineLabel))+")")
              .attr("font-size", fontSize)
              .style("text-anchor", "left")
              .text(lineLabel);
        lineLabel = Math.round(p.data[p.data.length-1].effVeloSMA*100)/100;
        p.g.append("text")
              .attr("class", "source")
              .attr("fill", "#f77300")
              .attr("transform", "translate("+(p.width-10)+","+(y(lineLabel))+")")
              .attr("font-size", fontSize)
              .style("text-anchor", "left")
              .text(lineLabel);
        lineLabel = Math.round(p.data[p.data.length-1].effVeloMean*100)/100;
        p.g.append("text")
              .attr("class", "source")
              .attr("fill", "#f77300")
              .attr("transform", "translate("+(p.width-10)+","+(y(lineLabel))+")")
              .attr("font-size", fontSize)
              .style("text-anchor", "left")
              .text(lineLabel);
        // citation: exec last to keep on top
        p.citation();
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

        // domains
        var yDom  = [];
        for(let i=0;i<p.data.length;i++)
        {
          p.data[i].Date = this.getDateFromOracleString(p.data[i].PurchaseDate);
        }
        p.data = _.sortBy(p.data,"Date")
        for(let i=0;i<p.data.length;i++)
        {
          if(i==0) p.data[i].total = parseFloat(p.data[i].Price)
          else p.data[i].total = parseFloat(p.data[i].Price) + p.data[i-1].total;
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

        p.data = _.filter(p.data,function(o) {
          return parseInt(o.temp) <= 100;
        });
        // domains
        var yDom = _.map(p.data,function(o){return parseFloat(o.temp)});
        var xDom = _.map(p.data,function(o){return o.starttime;})

        // scales
        var x = p.scaleX(moment(p.parseTime(d3.min(xDom))).subtract(30,'days'),
                         moment(p.parseTime(d3.max(xDom))).add(30,'days'));
        var y = p.scaleY(d3.min(yDom)-5,d3.max(yDom)+5);

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
            .attr("cx", function(d) {return x(p.parseTime(d.starttime));})
            .attr("cy", function(d) {return y(parseFloat(d.windspd))})
            .style("fill", function(d) { return "#994700";})

        var temp = p.g.append("g");
        temp.selectAll('.dot')
            .data(p.data)
            .enter()
            .append("circle")
            .attr('class','dot')
            .attr("r", 2)
            .attr("cx", function(d) {return x(p.parseTime(d.starttime));})
            .attr("cy", function(d) {return y(parseFloat(d.temp))})
            .style("fill", function(d) { return "#F77300";})

        // ---------------------------
        // Weather Legend
        var legend = {"x": x(p.parseTime("2014-04-01 00:00:00")),"y":y(-11.40)};
        legend.width     = x(p.parseTime("2015-12-01 00:00:00")) - legend.x;
        legend.height    = y(-14.75)-legend.y;
        legend.yOffset   = 15;
        legend.yBaseline = legend.yOffset + 5;
        var legendG = p.g.append("g")

        legendG.append("rect")
          .attr("transform","translate("+legend.x+","+legend.y+")")
          .attr("width",legend.width)
          .attr("height",legend.height)
          .attr("fill","#FFF")
          .style("stroke","#000")
          .style("stoke-width","1px")
          .style("opacity",0.9);

        legendG.append("circle")
          .attr("r",3)
          .attr("cx",legend.x + 20)
          .attr("cy",legend.y + legend.yOffset)
          .style("fill", function(d) { return "#F77300";})

        legendG.append("text")
          .attr("class", "source")
          .attr("fill", "#000")
          .attr("transform", "translate("+(legend.x+30)+","+(legend.y+legend.yBaseline)+")")
          .attr("font-size", 12)
          .style("text-anchor", "left")
          .text("Temperature (ºC)");

        legendG.append("circle")
          .attr("r",3)
          .attr("cx",legend.x + 140)
          .attr("cy",legend.y + legend.yOffset)
          .style("fill", function(d) { return "#994700";})

        legendG.append("text")
          .attr("class", "source")
          .attr("fill", "#000")
          .attr("transform", "translate("+(legend.x+150)+","+(legend.y+legend.yBaseline)+")")
          .attr("font-size", 12)
          .style("text-anchor", "left")
          .text("Wind Speed (MPH)");

        // End Weather Legend
        // ---------------------------
        // citation: exec last to keep on top
        p.citation();
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
            .attr("r", 2)
            .attr("cx", function(d) {return x(p.parseTime(d.End));})
            .attr("cy", function(d) {return y(moment.duration(d["Time in bed"]).asHours())})
            .style("fill", function(d) { return "#F77300";})

        // citation: exec last to keep on top
        p.citation();
      };
    }
  }
);
