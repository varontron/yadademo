define(
  [
     'component/base',
     'mixin/withViz',
     'moment'
  ],
  function(base,withViz,moment)
  {
    'use strict';
    return base.mixin(Viz,withViz);
    function Viz()
    {
      this.addViz = function(e,d) {
        if(!!d.fn && typeof this[d.fn] == 'function')
        {
          this[d.fn](d);
        }
        else if(!!d.id)
        {
          this[d.id+'Viz'](d);
        }
        else
        {
          this.attr.fn.call(this,this.attr);
        }
        if(!!d.tab)
          d.tab.viz = true;


        this.trigger('executed.viz',d);
      };

      this.redraw = function(e,d) {
        //console.log([e,d]);

      };

      this.defaultAttrs({

      });

      this.after('initialize', function() {
        this.on('request.viz',this.addViz);
        this.on('request-redraw.viz',this.addViz);
        this.enrich();
      });

      /**
       * bootstrap rich ui
       */
      this.enrich = function() {

      };
    }
  }
);
