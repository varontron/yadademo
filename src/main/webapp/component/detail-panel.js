define(
  [
     'component/base',
     'datatables',
     'mixin/withConfig'
  ],
  function(base,datatables,withConfig)
  {
    'use strict';
    return base.mixin(DetailsPanel,withConfig);
    function DetailsPanel()
    {
      this.defaultAttrs({
      });

      this.after('initialize', function() {
        this.enrich();
      });

      this.enrichTableTab = function(id,tab) {
        if(!!tab.cols)
        {
          // datatable defaults
          var defaults = {
            data: tab.data,
            // ajax: {
            //   data: {
            //     q: tab.q,
            //     pz: -1
            //   },
            //   dataSrc: function(json) {
            //     return json.RESULTSET.ROWS;
            //   }
            // },
            columns: tab.cols,
            pagingType: 'simple_numbers',
            dom: '<"top"f>t<"bottom"ip>',
            language: {
              search: 'Filter:'
            }
          };
          var conf = !!this['table_'+id] ? $.extend(true,defaults,this['table_'+id]()):defaults;
          this.$node.find('table').dataTable(conf);
        }
      };

      this.enrichViewTab = function(id,tab) {

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
        var id  = this.$node.attr('id').split('-')[0];
        var tab = window.yadademo.content.tabs[id];
        if(!!tab.q)
        {
          var a   = this.executeYADAQuery(tab.q)
          var aResolve = function(r) {
            tab['data'] = r.RESULTSET.ROWS;
            that.enrichTableTab(id,tab);
            that.enrichLearnTab(id,tab);
          };
          var aReject = function(e) {
            alert("Problem with detail data query:" + e);
          };

          $.when(a).then(aResolve,aReject);
        }
      };
    }
  }
);
