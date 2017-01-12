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


      this.defaultAttrs({
        'view': '.look-tab'
      });

      this.after('initialize', function() {
        this.on('executed.viz',this.checkVizExecution);
        this.on('request.table',this.enrichTableTab);
        this.enrich();
      });

      this.checkVizExecution = function(e,d) {
        var tabs = window.yadademo.content.tabs;
        if(_.reduce(_.map(_.values(tabs),"viz"),function(e,o) {return !!(e&&o);}))
          this.enrichTableTabs();
        else
          return false;
      };

      this.enrichTableTabs = function() {
        var that = this;
        var tabs = window.yadademo.content.tabs;
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

      this.enrichViewTab = function(id,tab) {
        var attrs = {};
        var tmplvars = {
          'id':id, // becomes 'id-viz', 'id-viz-box'
          'width':($('.container')[0].offsetWidth < 970 ? 700 : 900),
          'height':($('.container')[0].offsetWidth < 970 ? 525 : 675)
        };
        var evtPayload ={
          "id":id, // becomes 'idViz'
          "svgid":id+'-viz',
          "tab":tab // tabe is the content of the tab
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

      this.enrichLearnTab = function(id,tab) {
        require(['text!learn_'+id+'.html'],function(html) {
          $(html).appendTo('#'+id+'-learn');
        });
      };

      /**
       * bootstrap rich ui
       */
      this.enrich = function() {
        var that = this;
        // id is like cyc-detail-panel
        var id   = this.$node.attr('id').split('-')[0];
        var tab  = window.yadademo.content.tabs[id];
        var a    = null;
        var aResolve = function(r) {
          tab.loaded = true;
          if(id == 'gas')
          {
            tab.data = _.map(JSON.parse(r.RESULTSET.ROWS[0]).rows,function(o) {
              return o.value;
            });
          }
          else
          {
            tab.data = r.RESULTSET.ROWS;
          }
          that.trigger(id+'.viz',{}); // summary tab events
          that.enrichViewTab(id,tab);
          //that.enrichTableTab(id,tab);
          //that.enrichLearnTab(id,tab);
        };
        var aReject = function(e) {
          alert("Problem with detail data query:" + e);
        };
        if(!!tab.q)
        {
          a = this.executeYADAQuery(tab.q,tab.p)
          $.when(a).then(aResolve,aReject);
        }
        else if(!!tab.ajax)
        {
          a = $.ajax({
            data:tab.ajax
          });
          $.when(a).then(aResolve,aReject);
        }
      };
    }
  }
);
