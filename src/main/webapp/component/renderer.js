  define(
  [
   'flight',
   'mixin/withTemplate'
  ],

  function(flight,withTemplate) {
  'use strict';

    return flight.component(Renderer,withTemplate);

    function Renderer() {
      this.defaultAttrs({
        nest:'.nest'
      });

      /**
       * Render an html fragment from a hogan template, append it to the dom,
       * and then attach a flight component. After attachment,
       * renderer will fire an 'attached.content' event targeted at the
       * originating event node.
       *
       * Required and optional elements in the 'd' payload include:
       * <pre>
       *  Required:
          'template' : the name of the hogan template
          'selector' : the css selector of the node to which to attach the flight component

          Optional:
          'component': the name of the flight component, if omitted, defaults to the template name
          'parent'   : the selector of the node to which to append the html, if omitted, defaults to '.nest'
          'attrs'    : the default attributes to include in component initialization. Optional
          'action '  : set to true to call $(parent).prepend(html) instead of $(parent).append(html)
          'event'    : the custom event to bubble to the caller of 'request.renderer',
                       defaults to 'attached.renderer'
          'target'   : the target of 'event'
          'payload'  : data object to pass back to the callback event,
          'tmplvars': key-value pairs corresponding to pass to the render function instead
                       of attrs. if tmplvars is undefined, attrs will be used.  This is good if
                       there is a lot of overlap between the two objects.
       * </pre>
       * @param e the event
       * @param d the data payload
       *
       */

      this.addContent = function(e,d) {
        var self    = this;
        var dparent = d.parent || this.select('nest');
        var parent  = dparent instanceof $ ? dparent : $(dparent);
        var comp    = d.component || d.template;
        var tmlvars = !!!d.tmplvars ? d.attrs : d.tmplvars;
        var html    = this.render(d.template,tmlvars);
        var cbEvt   = d.event || 'attached.renderer'; // the callback event to trigger after attach
        var target  = d.target || e.target;
        var action  = !!!d.action ? 'append' : d.action;
        var payload = flight.utils.merge({},d.payload);
        parent[action](html);
        require(['component/'+comp],function(Cmp) {
          Cmp.attachTo(d.selector,d.attrs);
          self.trigger(target,cbEvt,payload);
        });
      }

      this.after('initialize', function() {
        this.on('request.renderer',this.addContent);
      });
    }
});
