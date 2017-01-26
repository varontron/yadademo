require.config({
		waitSeconds: 0,
		baseUrl: '',
    paths: {
      text:         "lib/text.min",//"https://cdnjs.cloudflare.com/ajax/libs/require-text/2.0.12/text.min",
      hogan:        "lib/hogan.min",//"https://cdnjs.cloudflare.com/ajax/libs/hogan.js/3.0.2/hogan.min",
    	bootstrap:    "lib/bootstrap.min",//"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min",
    	datatables:   "lib/jquery.dataTables.min",//"http://cdn.datatables.net/1.10.7/js/jquery.dataTables.min",
    	domReady:     "lib/domReady.min",//"http://cdnjs.cloudflare.com/ajax/libs/require-domReady/2.0.1/domReady.min",
    	flight:       "lib/flight.min",//"https://cdnjs.cloudflare.com/ajax/libs/flight/1.1.4/flight.min",
    	jquery:       "lib/jquery.min",//"http://cdnjs.cloudflare.com/ajax/libs/jquery/1.10.2/jquery.min",
    	lodash:		    "lib/lodash.min",//"http://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.16.4/lodash.min",
    	d3:           "lib/d3.min", //"https://cdnjs.cloudflare.com/ajax/libs/d3/4.4.0/d3",
      moment:       "lib/moment.min"//"https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.12.0/moment.min"
    },
    shim: {
    	bootstrap: { deps : ["jquery"] },
    	flight:    { deps : ["jquery"], exports: 'flight'},
    	templates: { deps : ["hogan"] },
    },
    map: {    },
    packages: [ ]
});

require(
[
// 'backbone'
],
function() {
  require(['jquery','boot','text!config.json'],
      function($,Boot,config){
      	Boot.initialize(config);
      });
});
