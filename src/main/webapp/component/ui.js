define(
  [
     'component/base',
     'text!intro.html'
  ],
  function(base,intro)
  {
    'use strict';
    return base.mixin(UI);
    function UI()
    {
      this.defaultAttrs({
        'nest'      : '.nest',
        'left'      : '.left-panel',
        'vehicles'  : '.vehicles-box',
        'vehicles-panel':   '.vehicles-panel-body',
        'variables' : '.variables-box',
        'constants' : '.constants-box'
      });

      this.after('initialize', function() {
        var that = this;
        this.enrich();
      });

      this.attachVehicles = function() {
        var html = this.render('vehicles-panel',{});
        $(html).appendTo(this.attr.vehicles);
        var c = window.yadademo.content.vehicles;
        for(let i=0;i<c.length;i++)
        {
          html = this.render('vehicle',{
            "vehicle": i+1,
            "year": c[i].year,
            "make": c[i].make,
            "model": c[i].model,
            "start": "",
            "end": "",
            "mpg": c[i].mpg,
            "maintenance":c[i].maintenance
          });
          $(html).appendTo(this.attr['vehicles-panel']);
        }
      };

      this.attachVariables = function() {
        var c = window.yadademo.content.variables;
        this.trigger('request.renderer',{
          'template': 'variables-panel',
          'selector': this.attr.variables,
          'parent'  : this.attr.variables,
          'tmplvars': {
            "paid-holiday": c.pto['paid-holiday'],
            "personal-day": c.pto['personal-day'],
            "vacation-day": c.pto['vacation-day'],
            "gym-membership": c.savings['gym-membership'],
            "life-ins-prem": c.savings['life-ins-prem'],
            "monthly-pkg-subsidy": c.parking['monthly-pkg-subsidy'],
            "min-pkg-day": c.parking['min-pkg-day'],
            "max-pkg-day": c.parking['max-pkg-day'],
            "wah-days": c.parking['wah-days'],
            "max-io-days": c.parking['max-io-days'],
            "health-savings": c.miscellaneous['health-savings'],
            "rt-miles": c.miscellaneous['rt-miles']
          }
        });
      };

      this.attachConstants = function() {
        var c = window.yadademo.content.constants;
        var html = this.render('constants-panel',{
          "days-per-year": c['days-per-year'],
          "months-per-year": c['months-per-year'],
          "weeks-per-year": c['weeks-per-year'],
          "weekends-per-year": c['weekends-per-year'],
          "mps-to-mph": c['mps-to-mph'],
          "meters-to-miles": c['meters-to-miles'],
          "rounded-mps-to-mph": Math.round(c['mps-to-mph']*10000)/10000,
          "rounded-meters-to-miles": Math.round(c['meters-to-miles']*10000)/10000
        });
        $(html).appendTo(this.attr.left);
      };

      this.attachDetailPanels = function() {
        var that = this;
        var tabs = window.yadademo.content.tabs;
        for (let tab of _.keys(tabs))
        {
          var renderPayload = {
            'template':'detail-panel',
            'selector':'#'+tab+'-detail-panel',
            'parent':'#'+tab,
            'tmplvars':{
              'tabid':tab
            }
          };

          if(tab == "summary")
          {
            renderPayload = _.merge(renderPayload,
                                {"component" :"summaryViz",
                                 "selector" :"body"});
          }

          this.trigger('request.renderer',renderPayload);
        }
      }

      this.enrichHeader = function() {
        var html = this.render('header',{});
        $(html).appendTo(this.attr.nest);
      };

      this.enrichFooter = function() {
        var html = this.render('footer',{});
        $(html).appendTo(this.attr.nest);
      };

      this.enrichNav = function() {
        var html = this.render('nav',{});
        $(html).appendTo(this.attr.nest);
      };


      this.enrichContent = function() {
        var html = this.render('substrate',{intro:intro});
        $(html).appendTo(this.attr.nest);
        this.enrichFooter();
        this.attachVehicles();
        this.attachVariables();
        this.attachConstants();
        this.attachDetailPanels();

      };



      /**
       * bootstrap rich ui
       */
      this.enrich = function() {
        this.enrichHeader();
        // this.enrichNav();
        this.enrichContent();

      };
    }
  }
);
