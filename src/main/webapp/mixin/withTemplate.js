define(
  function(require) {
    return withTemplate;
    function withTemplate() {
      this.templates = require('templates');
      this.render = function(templateName, renderOptions) 
      {
        console.log('Rendering template: '+ templateName);
        if (templates[templateName]) 
        { 
          return templates[templateName].render(renderOptions); 
        } 
      };
    };
});