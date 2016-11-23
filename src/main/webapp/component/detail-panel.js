define(
  [
     'component/base',
     'datatables',
     'mixin/withUIHelper'
  ],
  function(base,datatables,withUIHelper)
  {
    'use strict';
    return base.mixin(DetailsPanel,withUIHelper);
    function DetailsPanel()
    {
      this.defaultAttrs({
      });

      this.after('initialize', function() {
        this.enrich();
      });

      /**
       * bootstrap rich ui
       */
      this.enrich = function() {

        var id  = this.$node.attr('id').split('-')[0];
        var tab = window.yadademo.content.tabs[id];
        if(!!tab.cols)
        {
          var defaults = {
            ajax: {
              //url:'http://'+window.yadademo.env.YADA+'?q='+tab.q,
              data: {
                q: tab.q,
                pz: -1
              },
              dataSrc: function(json) {
                return json.RESULTSET.ROWS;
              }
            },
            columns: tab.cols,
            //columnDefs: this['columnDefs_'+id] ? this['columnDefs_'+id]() : null,
            pagingType: 'simple_numbers',
            dom: '<"top"f>t<"bottom"ip>',
            language: {
              search: 'Filter:'
            }
          };
          var conf = !!this['table_'+id] ? $.extend(true,defaults,this['table_'+id]()):defaults;
          this.$node.find('table').dataTable(conf);
          // this.executeYADAQuery(tab.q);
        }
      };
    }
  }
);
