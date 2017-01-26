  define(
  [
     'component/base',
     'datatables',
     'moment',
     'mixin/withConfig'
  ],
  function(base,datatables,moment,withConfig)
  {
    'use strict';
    return base.mixin(DetailsPanel,withConfig);
    function DetailsPanel()
    {
      var tabs   = window.yadademo.content.tabs;
      var data   = window.yadademo.content.data;
      var panels = window.yadademo.content.panels;

      this.checkDataLoaded = function() {
        var that = this, loaded = false;
        var interval = setInterval(check, 50);
        function check() {
          let arr = panels[that.attr.panelId].data;
          loaded = arr.length == 1 ? data[arr[0]].loaded
              : _.reduce(arr,function(e,o) {
                  var e1 = typeof e == 'boolean' ? e : data[e].loaded;
                  var x = e1 && data[o].loaded;
                  return !!(x);
                });
          if(!!loaded)
          {
            clearInterval(interval);
            console.log([that.attr.panelId,arr,"loaded"]);
            that.trigger('request.view',{});
          }
        };
      };

      this.checkVizExecution = function(e,d) {
        if(panels[d.id].viz)
          this.enrichLearnTab(d.id);
        if(_.reduce(_.map(_.values(panels),"viz"),function(e,o) {return !!(e&&o);}))
        {
          this.enrichTableTabs();
        }
        else
          return false;
      };

      this.enrichTableTabs = function() {
        var that = this;
        _.each(_.keys(tabs),function(s) {
          that.trigger('.detail-panel','request.table',{id:s,tab:tabs[s]});
        });
      };

      this.enrichTableTab = function(e,d) {
        if(d.id == this.$node.attr('id').split('-')[0])
        {
          var id = d.id, tab = d.tab;
          var that = self = this;
          if(!!tab.colDefs)
          {
            for(let def of tab.colDefs)
            {
              if(!!def.render && /^function/.test(def.render))
              {
                def.render = new Function("return " + def.render)();
              }
            }
          }
          if(!!tab.cols)
          {
            // datatable defaults
            var defaults = {
              data: tab.data,
              columns: tab.cols,
              columnDefs: tab.colDefs||[],
              pagingType: 'simple_numbers',
              dom: '<"top"f>t<"bottom"ip>',
              language: {
                search: 'Filter:'
              }
            };
            var conf = !!this['table_'+id] ? $.extend(true,defaults,this['table_'+id]()):defaults;
            this.$node.find('table').dataTable(conf);
          }
        }
      };

      this.enrichViewTab = function(e,d) {
        var id = this.attr.panelId;
        var panel = panels[id];
        var attrs = {};
        var tmplvars = {
          'id':id, // becomes 'id-viz', 'id-viz-box'
          'width':$('.container')[0].offsetWidth *.48,
          'height':$('.container')[0].offsetWidth *.48/1.33,
          'snark':panels[id].snark,
        };
        var evtPayload ={
          "fn":panel.fn,
          "id":id, // becomes 'idViz'
          "svgid":id+'-viz',
          "tab":panel // tabe is the content of the tab
        };
        var renderPayload = {
          'template':'viz',
          'selector':this.select('view'),
          'parent':this.select('view'),
          'attrs':attrs,
          'tmplvars':tmplvars,
          'event':'request.viz',
          'target':this.select('view'),
          'payload':evtPayload
        };
        this.trigger('request.renderer',renderPayload);
      };

      this.enrichLearnTab = function(id) {
        if($('#'+id+'-copy').children().length == 1)
        {
          require(['text!html/smry-'+id+'.html'],function(html) {
            $(html).appendTo('#'+id+'-copy');
          });
        }
      };

      /**
       * bootstrap rich ui
       */
      this.enrich = function() {

      };

      this.requestRedraw = function(e,d) {
        var id = this.attr.panelId;
        var panel = panels[id];
        var evtPayload ={
          "fn":panel.fn,
          "id":id, // becomes 'idViz'
          "svgid":id+'-viz',
          "tab":panel // tabe is the content of the tab
        };
        this.trigger(this.select('view'), 'request-redraw.viz', evtPayload );
      }

      this.defaultAttrs({
        'view': '.view-tab',
        'hdr' : '.panel-heading',
        'svg' : 'svg'

      });

      this.after('initialize', function() {
        var that = this;
        this.checkDataLoaded();
        this.on('request.view',this.enrichViewTab);
        this.on('executed.viz',this.checkVizExecution);
        this.on('request.table',this.enrichTableTab);
        this.on('click',{
          'hdr': this.requestRedraw
        });
        this.enrich();
      });

    }
  }
);
