define(
  [
     'component/base',
  ],
  function(base)
  {
    'use strict';
    return base.mixin(VariablesPanel);
    function VariablesPanel()
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

      };
    }
  }
);
