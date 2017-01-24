define(
  function(require)
  {
    return withVizPrep;
    function withVizPrep() {
      var d3     = require('d3');
      var moment = require('moment');

      this.vizPrep = function(opt) {
        var that   = this,
            r = {},
            width  = opt.width,
            height = opt.height,
            id     = opt.svgId;

        r.data   = opt.tab.data;
        r.svg    = d3.select('#'+id);
        r.W      = parseInt(r.svg.style("width"));
        r.margin = {top: r.W*.1, right: r.W*.1, bottom: r.W*.1, left: r.W*.135};
        r.width  = +r.svg.attr("width") - r.margin.left - r.margin.right;
        r.height = +r.svg.attr("height") - r.margin.top - r.margin.bottom;
        r.g      = r.svg.append("g").attr("transform", "translate(" + r.margin.left + "," + r.margin.top + ")");
        r.parseTime   = d3.timeParse(opt.timeParseFormat);
        r.titleOffset = 15,
        r.axisOffset  = 10;

        // title
        r.g.append("text")
            .attr("transform", "translate("+(r.width/2)+",0)")
            .attr("class","title")
            .text(opt.title);


        r.scaleX = function(min,max) {
          return d3.scaleTime()
            .rangeRound([0, r.width-10])
            .domain([min,max]);
        };

        r.scaleY = function(min,max) {
          return d3.scaleLinear()
            .rangeRound([r.height, r.titleOffset])
            .domain([min,max]);
        };

        // x axis
        r.xAxis = function(x,ticks) {
          r.g.append("g")
              .attr("class", "axis axis--x")
              .attr("transform", "translate(0," + (r.height + r.axisOffset) + ")")
              .call(d3.axisBottom(x)
                      .ticks(ticks)
                      .tickSizeOuter(0)
                      .tickSizeInner(-r.height))   //-10+r.titleOffset
            .append("text")
              .attr("y", -10)
              .attr("x", r.width-10)
              .attr("dy", "0.71em")
              .text(opt.xLabel);

        };

        // y axis
        r.yAxis = function(y) {
          r.g.append("g")
              .attr("class", "axis axis--y")
              .attr("transform", "translate(-10,0)")
              .call(d3.axisLeft(y)
                      .tickSizeOuter(0)
                      .tickSizeInner(-r.width))
            .append("text")
              .attr("fill", "#000")
              .attr("transform", "rotate(-90)")
              .attr("y", 6)
              .attr("x", -r.titleOffset)
              .attr("dy", "0.71em")
              .text(opt.yLabel);
        };

        // citation
        var gCite = function() {
          var g = r.g.append("g");
          g.append("text")
              .attr("class", "source")
              .attr("transform", "translate(5,"+(r.height-18)+")")
              .text("Source:")
          g.append("text")
              .attr("class", "source")
              .attr("transform", "translate(5,"+(r.height-8)+")")
              .text(opt.citation)
        };
        r.citation    = gCite;

        // merge opt in for arbitrary settings
        r = _.merge(r,_.omit(opt,["tab","timeParseFormat","citation","xAxis","yAxis"]));

        return r;
      }
    }
  }


);
