define(
	function(require)
  {
    return { initialize: initialize };
    function initialize(config)
    {
      require(['jquery','domReady','bootstrap','lodash'],
        function ($,domReady,bootstrap,_) {
          // load config
          if (_.isString(config))
          {
            try
            {
              config = JSON.parse(config);
            }
            catch (e)
            {
              alert("Configuration cannot be parsed...\nNothing is going to work...");
              config = {};
              return;
            }
          }
          // set environment
          var env = findEnvironment(config);
          if (!!env)
          {
            window[config.context] = config;
            window[config.context].env = env;
            if (console && console.log)
              console.log("Selected Enrivonment: " + env.name);
          }
          else
          {
            if (console && console.log)
              console.log("No environment found!");
          }

          // set ajax defaults
  				var appContext = (config.context != "ROOT" ? config.context + '/': '');
  				//var defaultUrl = '/' + appContext + 'yada.jsp';
  				$.ajaxSetup({
  					url: 'http://'+env.YADA,
  		      type: 'GET',
  		      dataType: 'json',
  		      data: { pz: -1, c:false } //, r: 'RESTPassThruResponse' }
  				});

          // init renderer
          var renderer = require('component/renderer');
  				renderer.attachTo('body');
          // init ui
  				var UI = require('component/ui');
  				UI.attachTo('.nest');
        }
      );
    }

    function findEnvironment(config)
    {
      if (!!config && typeof config == "object")
      {
        var url = window.location.href;
        var key = _.find(_.keys(config.environment), function(rx) {
          return new RegExp(rx).test(url);
        });
        if (!!key) { return config.environment[key]; }
      }
      alert("There's a problem with the config...\nNothing will work.");
      return null;
    }
  }
);
