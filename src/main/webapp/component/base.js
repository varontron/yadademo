define(
  ['jquery','flight','lodash','mixin/withTemplate','mixin/withYADAUtils'],
  function($,flight,_,withTemplate,withYADAUtils) {
    'use strict';
    return flight.component(Base,withTemplate,withYADAUtils);
    function Base() {
      this.overrideDefaultAttrs = function(defaults) {
        flight.utils.push(this.defaults, defaults, false) || (this.defaults = defaults);
      };
    }
  }
);
