define(
	function(require) {

		return withYADAUtils;

		function withYADAUtils() {

		  //var moment = require('moment');

		  var body = $('body');

		  this.prepMonths = function() {
        moment.updateLocale('en', {
          monthsShort : ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"]
        });
      };

		  /**
       * For Oracle sequences
       */
	    this.getNextVal = function(seq)
	    {
	      var val = -1;
	      $.ajax({
	        async: false,
	        data:{
	          q:'YADA select nextval',
	          c:false,
	          p:seq
	        },
	        success: function(data) {
	          val = data.RESULTSET.ROWS[0].VAL;
	        }
	      });
	      return val;
	    };

	    this.checkForPK = function(qname, params, idCol)
	    {
	      var id   = -1, data = {}, type = 'GET';
	      if (idCol === null || idCol === undefined || idCol === '')
	      {
	        idCol = 'ID';
	      }
	      data['q'] = qname;
	      data['p'] = params;
	      data['c'] = false;
	      data['pz'] = -1;

	      $.ajax({
	        type: type,
	        data: data,
	        async: false,
	        success: function(respObj) {
	          if(respObj.RESULTSET.ROWS.length > 0)
	            id = respObj.RESULTSET.ROWS[0][idCol];
	        },
	        error: function(jqXhr,status,error) {
	          id = -1;
	        }
	      });
	      return id;
	    };


        this.unravelResultSets = function(yadaResults){
            if(yadaResults.RESULTSETS) {
                return _.reduce(yadaResults.RESULTSETS, function(allRows, rs) {
                    return allRows.concat(rs.RESULTSET.ROWS);
                },[]);
            }else if(yadaResults.RESULTSET) {
                return yadaResults.RESULTSET.ROWS;
            }
            return null;
        }




        this.unwrapDatatableEditorEdits = function(ddata,scan,seed, tolerateEmpties, toleratedUndefined) {

            if(!seed) { seed= function(x) { return x; }}
            else if(!_.isFunction(seed)) {
                throw new Error("seed parameter must be a (factory) function");
            }

            if(!_.isObject(scan)) {
                throw new Error("scan must be an associative array: field-name to Yada query");
            }
            var self = this;
            var snap= _.reduce(ddata, function(X, dat,id) {
                _.each(scan, function(qname, field) {
                    if( (!self.isEmpty(dat[field]))
                     || (tolerateEmpties && ! _.isUndefined(dat[field]))
                     || (toleratedUndefined)) {
                        if(_.isUndefined(X.JP[field])) {
                            X.JP[field] = {qname: qname, DATA: []};
                        }
	                    var forField = seed(id);
	                    forField[field]=dat[field];
	                    X.JP[field].DATA.push(forField);
                    }
                });
                X.order[id] = X.recover.length; // recover.length is used as a iterator index here too.
                X.recover.push(seed(id));
                return X;
            },{order:{}, JP:{}, recover:[]});
            return snap;
        }

	    this.executeYADAQuery = function(qname, params, async, update)
	    {

	      var dfd  = new $.Deferred(),
	          resp = null,
	          data = {},
	          type = 'GET';

	      if (typeof qname === 'string')
	      {
	        data['q'] = qname;
	        data['p'] = params;
	        data['c'] = false;
	        data['pz'] = -1;
	        if (update)
	        {
	          // should only be omitted or true
	          data['m'] = update;
	        }
	      }
	      else
	      {
	        data['j'] = JSON.stringify(qname);
            // when JSONParams, assume this is an update -
            // however, if update (4th param) is passed, be sensitive to the possible value of 'not true'
	        if(_.isUndefined(update) || update) {
                data['m'] = 'update';
            }
	        data['c'] = false;
	        data['pz'] = -1;
	        type = 'POST';
	      }

	      $.ajax({
	        type: type,
	        data: data,
	        async: async === null || async === undefined || !async ? true : false,
	        success: function(respObj) {
	          resp = respObj;
	          dfd.resolve(resp);
	        },
	        error: function(jqXhr,status,error) {
	          dfd.reject([jqXhr,status,error]);
	        }
	      });
	      return dfd.promise();
	    };

	    this.getStructure = function(selector,attr) {
	      var curModel = {};
	      $(selector).each(function() {
	        var key = $(this).attr(attr);
	        var val = $(this).val();
	        if(val !== null && val !== undefined && val !== "")
	        {
	          curModel[key] = val;
	        }
	      });
	      return curModel;
	    };

	    this.getOracleDateString = function(date)
	    {
	      var d      = date.getDate();
	      var months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

	      d = d < 10 ? '0'+d : d;
	      var m = months[date.getMonth()];
	      var y = date.getFullYear().toString().substring(2);
	      return d+'-'+m+'-'+y;
	    };

	    this.getOracleDateStringFullYear = function(date,lc)
	    {
	      var d      = date.getDate();
	      var months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

	      d = d < 10 ? '0'+d : d;
	      var m = months[date.getMonth()];
	      var y = date.getFullYear().toString();
	      if (lc)
	        m = m.substring(0,1) + m.substring(1).toLowerCase();

	      return d+'-'+m+'-'+y;
	    };

	    this.getOracleDateStringForUpdates = function(d,lc)
	    {
	      var dy   = d.getFullYear();
	      var dm   = d.getMonth() < 9 ? '0'+(d.getMonth()+1) : (d.getMonth()+1);
	      var dd   = d.getDate() < 10 ? '0'+d.getDate() : d.getDate();
	      return dy+'-'+dm+'-'+dd;
	    };

	    this.getDateFromOracleString = function(s)
	    {
	      // 02-OCT-2012: 11

	      var yrLen = s.length == 11 ? 4 : 2;
	      var y = s.substring(7,7+yrLen);
	      var d = s.substring(0,2);
	      var months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
	      var m = s.substring(3,6);
	      for (var i in months)
	      {
	        if (months[i] === m)
	        {
	          m = parseInt(i) + 1;
	          break;
	        }
	      }
	      m = m < 10 ? "0"+m : m;
	      return y+m+d;
	    };
	  };
});
